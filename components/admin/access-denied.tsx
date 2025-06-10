import React from 'react'
import { Shield, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Access Denied Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Main Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. This area is restricted to super users only.
          </p>
          
          {/* Status Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Not authorized for admin access</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Main App
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:admin@purescan.app?subject=Admin Access Request'}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request Admin Access
            </Button>
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe you should have access to this area, please contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 