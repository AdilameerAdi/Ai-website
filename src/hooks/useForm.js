import { useState, useCallback, useEffect } from 'react';
import { validateForm } from '../utils/errorHandler';

export const useForm = (initialValues = {}, validationRules = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false,
    onSubmit = () => {},
    onError = () => {}
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    if (!validationRules[name]) return null;
    
    const fieldRules = { [name]: validationRules[name] };
    const fieldData = { [name]: value };
    const result = validateForm(fieldData, fieldRules);
    
    return result.errors[name] || null;
  }, [validationRules]);

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const result = validateForm(values, validationRules);
    setErrors(result.errors);
    return result.isValid;
  }, [values, validationRules]);

  // Handle field change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange && validationRules[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateOnChange, validateField, validationRules]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validateOnBlur && validationRules[name]) {
      const error = validateField(name, values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateOnBlur, validateField, values, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);

    // Mark all fields as touched
    const touchedFields = {};
    Object.keys(validationRules).forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    // Validate all fields
    const isValid = validateAllFields();

    if (isValid) {
      try {
        await onSubmit(values);
        if (resetOnSubmit) {
          reset();
        }
      } catch (error) {
        onError(error);
      }
    } else {
      onError(new Error('Form validation failed'));
    }

    setIsSubmitting(false);
  }, [values, validationRules, validateAllFields, onSubmit, onError, resetOnSubmit]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  // Set form values
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Set form errors
  const setFormErrors = useCallback((newErrors) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Get field props for easy integration with input components
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => {
      const value = e.target ? e.target.value : e;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : undefined,
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  }), [values, errors, touched, handleChange, handleBlur]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFormValues,
    setFormErrors,
    clearErrors,
    validateField,
    validateAllFields,
    getFieldProps
  };
};

// Custom hook for async form submission with retry logic
export const useAsyncForm = (initialValues = {}, validationRules = {}, submitFn, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    ...formOptions
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  const handleSubmitWithRetry = async (values) => {
    let attempts = 0;
    
    while (attempts <= maxRetries) {
      try {
        setLastError(null);
        const result = await submitFn(values);
        setRetryCount(0);
        return result;
      } catch (error) {
        attempts++;
        setRetryCount(attempts);
        setLastError(error);
        
        if (attempts > maxRetries) {
          throw error;
        }
        
        // Don't retry on client errors (4xx)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempts - 1)));
      }
    }
  };

  const form = useForm(initialValues, validationRules, {
    ...formOptions,
    onSubmit: handleSubmitWithRetry
  });

  return {
    ...form,
    retryCount,
    lastError,
    isRetrying: retryCount > 0 && form.isSubmitting
  };
};

// Custom hook for multi-step forms
export const useMultiStepForm = (steps, initialValues = {}, validationRules = {}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const form = useForm(initialValues, validationRules);

  const nextStep = useCallback(() => {
    // Validate current step before proceeding
    const currentStepFields = steps[currentStep]?.fields || [];
    const currentStepRules = {};
    
    currentStepFields.forEach(field => {
      if (validationRules[field]) {
        currentStepRules[field] = validationRules[field];
      }
    });

    const result = validateForm(form.values, currentStepRules);
    
    if (result.isValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      form.setFormErrors(result.errors);
    }
  }, [currentStep, steps, form, validationRules]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep] || {};

  return {
    ...form,
    currentStep,
    currentStepData,
    completedSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    totalSteps: steps.length
  };
};

export default useForm;