import ReportSightingForm from '../components/ReportSightingForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mt-6">St. Cloud Superman Tracker</h1>
      <p className="text-center text-gray-600 mb-6">Report your sightings below 👇</p>
      <ReportSightingForm />
    </main>
  )
}
