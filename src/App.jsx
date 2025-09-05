import Navbar from "./navbar"
import Hero from "./frontend/hero"
import Problem from "./frontend/problem"
import Solution from "./frontend/solution"
import Features from "./frontend/features"
import HowItWorks from "./frontend/Howitwork"
import Highlights from "./frontend/Highlights"
import Pricing from "./frontend/pricing"
import Roadmap from "./frontend/roadmap"
import FAQs from "./frontend/faqs"
import ContactDemo from "./frontend/contact"
import FeedbackForm from "./frontend/feedback"
import Footer from "./frontend/Footer"
import AuthPage from "./login/Auth"
export default function App(){

  return<>
<Navbar></Navbar>
<Hero></Hero>
<Problem></Problem>
<Solution></Solution>
<Features></Features>
<HowItWorks/>
<Highlights></Highlights>
<Pricing></Pricing>
<Roadmap></Roadmap>
<FAQs></FAQs>
<ContactDemo></ContactDemo>
<FeedbackForm/>
<Footer></Footer>
<AuthPage></AuthPage>
  </>
}