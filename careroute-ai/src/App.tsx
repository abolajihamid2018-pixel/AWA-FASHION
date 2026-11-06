import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Audience, CallToAction, Features, Footer, HowItWorks, Problem, Roadmap } from './components/Sections'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Audience />
        <Roadmap />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}
