'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserModal } from '@/components/admin'
import { getUsers, deleteUser, updateUser, Profile as AdminProfile } from '@/lib/supabase-admin'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  UserPlus,
  MoreHorizontal
} from 'lucide-react'
import { AdminTabLayout } from '@/components/admin/admin-layout'
import { UserTable } from '@/components/admin'

interface UserWithStats extends AdminProfile {
  achievement_count?: number
  last_active?: string
}

export default function AdminUsersPage() {
  return (
    <AdminTabLayout activeTab="users">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Accounts</h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts, permissions, and account status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name, email, or ID..."
                className="pl-10"
              />
            </div>
            <div className="flex space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500">
                <option>All Roles</option>
                <option>Admin</option>
                <option>User</option>
                <option>Moderator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">User Accounts</h3>
                <p className="text-sm text-gray-600 mt-1">Manage all user accounts and their permissions</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>Showing all users</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <UserTable users={[]} onEdit={() => {}} onDelete={() => {}} />
          </div>
        </div>
      </div>
    </AdminTabLayout>
  )
} 