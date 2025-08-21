import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Users, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/125th PCSA background.png')" }}
    >

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="container mx-auto px-4 py-16 relative">
            {/* Banner Image */}
            <div className="w-full mb-10">
              <img
                src="/125th_PCSA_website_slider_1160x390_px.png"
                alt="PCSA 125th Banner"
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
            </div>

            {/* Centered Funrun image */}
            <div className="flex justify-center mb-16">
              <img src="/Fun_Run.png" alt="Funrun Logo" className="h-40 md:h-60 w-auto drop-shadow-lg" />
            </div>
          {/* Event Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center card-hover glass-effect border-0">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Event Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">September 7, 2025</p>
                <p className="text-sm text-gray-500 mt-2">Stay tuned for announcements</p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover glass-effect border-0">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Event Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">Cotabato City Plaza</p>
                <p className="text-sm text-gray-500 mt-2">Central meeting point for all participants</p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover glass-effect border-0">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Registration Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">Individual & Group</p>
                <p className="text-sm text-gray-500 mt-2">Flexible registration options</p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Options */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Choose Your Registration Method</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {/* Individual Registration */}
              <Card className="border-0 shadow-xl card-hover bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Individual Registration</CardTitle>
                  <CardDescription className="text-lg text-gray-600">Quick and easy self-registration</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Instant online registration</span>
                    </div>
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Select your preferred Field Office</span>
                    </div>
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Upload payment receipt securely</span>
                    </div>
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Receive instant confirmation</span>
                    </div>
                  </div>
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                    <Link href="/register">Register Now</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Login */}
              <Card className="border-0 shadow-xl card-hover bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Field Office Admin</CardTitle>
                  <CardDescription className="text-lg text-gray-600">Manage registrations and groups</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Manage group registrations</span>
                    </div>
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Upload Excel participant lists</span>
                    </div>
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Monitor individual submissions</span>
                    </div>
                    <div className="flex items-center text-left">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Export comprehensive reports</span>
                    </div>
                  </div>
                  <Link href="/admin/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 bg-transparent"
                    >
                      Admin Login
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Field Offices Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">Participating Field Offices</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose from any of our participating Field Offices for your registration and payment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Cotabato City", color: "from-blue-500 to-blue-600" },
              { name: "Sulu Station", color: "from-green-500 to-green-600" },
              { name: "Basilan Station", color: "from-teal-500 to-teal-600" },
              { name: "Lanao Del Sur", color: "from-purple-500 to-purple-600" },
              { name: "Tawi-Tawi", color: "from-orange-500 to-orange-600" },
              { name: "Maguindanao", color: "from-red-500 to-red-600" },
            ].map((office, index) => (
              <Card key={office.name} className="text-center card-hover border-0 shadow-lg">
                <CardContent className="p-6">
                  <div
                    className={`mx-auto w-12 h-12 bg-gradient-to-r ${office.color} rounded-full flex items-center justify-center mb-4`}
                  >
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <p className="font-semibold text-gray-800">FO - {office.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            
            <h3 className="text-lg font-bold mb-1">PCSA 2025 Funrun Registration System</h3>
            <p className="text-gray-400">Centralized Field Office Management</p>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-xs">© 2025 PCSA Funrun Registration System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
