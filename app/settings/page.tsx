'use client'

import React, { useState } from 'react'
import { SettingsTabs } from '@/components/settings/settings-tabs'
import { AccountSettings } from '@/components/settings/account-settings'
import { User, HelpCircle, Settings, Mail, Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const settingsTabs = [
  {
    id: 'account',
    label: 'Account',
    icon: <User className="h-4 w-4" />
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: <HelpCircle className="h-4 w-4" />
  }
]

function HelpSettings() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Main Help Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Help & Support</CardTitle>
              <p className="text-blue-100 mt-2">
                We're here to help you get the most out of PureScan2
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Support */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Support
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Email Support</span>
                    </div>
                    <p className="text-blue-700 text-sm mb-2">support@purescan.app</p>
                    <p className="text-blue-600 text-xs">Usually responds within 24 hours</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Live Chat</span>
                    </div>
                    <p className="text-green-600 text-xs mb-3">Available Monday - Friday, 9 AM - 6 PM EST</p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  App Information
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Version</span>
                      <span className="text-purple-600 font-mono">v1.2.0</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Last Updated</span>
                      <span className="text-gray-600 text-sm">December 2024</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Build</span>
                      <span className="text-gray-600 font-mono text-sm">1.2.0-stable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-900 mb-2">How accurate are the skin analysis results?</h4>
              <p className="text-blue-700 text-sm">
                Our AI-powered analysis uses advanced computer vision to provide highly accurate results. However, 
                results should be used as guidance and not replace professional dermatological advice.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-900 mb-2">Is my data secure and private?</h4>
              <p className="text-green-700 text-sm">
                Yes, we take privacy seriously. All scan data is encrypted and stored securely. 
                You control who can see your results through our sharing features.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-medium text-purple-900 mb-2">How do I achieve better scan results?</h4>
              <p className="text-purple-700 text-sm">
                For best results, ensure good lighting, clean skin, and hold the camera steady. 
                Avoid heavy makeup or filters that might affect the analysis.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <h4 className="font-medium text-yellow-900 mb-2">Can I export my scan results?</h4>
              <p className="text-yellow-700 text-sm">
                Yes, you can share your results via social media or direct links. 
                We're working on PDF export features for future updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => window.open('https://purescan.app/privacy', '_blank')}
            >
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Privacy Policy</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => window.open('https://purescan.app/terms', '_blank')}
            >
              <Settings className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Terms of Service</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => window.location.href = '/about'}
            >
              <User className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">About PureScan2</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />
      case 'help':
        return <HelpSettings />
      default:
        return <AccountSettings />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your account preferences and get help when you need it
          </p>
        </div>

        {/* Tabs */}
        <SettingsTabs
          tabs={settingsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-8"
        />

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
} 