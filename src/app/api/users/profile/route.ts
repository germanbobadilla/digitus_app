import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    // For now, we'll get the user ID from query params
    // In production, you'd get this from JWT token or session
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        phoneNumber: true,
        website: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        preferredLanguage: true,
        timezone: true,
        companyName: true,
        companySize: true,
        industry: true,
        jobTitle: true,
        bio: true,
        avatar: true,
        institutionName: true,
        studentId: true,
        graduationYear: true,
        degree: true,
        major: true,
        taxId: true,
        registrationNumber: true,
        businessType: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// PUT /api/users/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    const body = await request.json()

    // Extract profile data
    const {
      name,
      userType,
      phoneNumber,
      website,
      address,
      city,
      state,
      country,
      postalCode,
      preferredLanguage,
      timezone,
      companyName,
      companySize,
      industry,
      jobTitle,
      bio,
      avatar,
      institutionName,
      studentId,
      graduationYear,
      degree,
      major,
      taxId,
      registrationNumber,
      businessType
    } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (userType !== undefined) updateData.userType = userType
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (website !== undefined) updateData.website = website
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (country !== undefined) updateData.country = country
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage
    if (timezone !== undefined) updateData.timezone = timezone
    if (companyName !== undefined) updateData.companyName = companyName
    if (companySize !== undefined) updateData.companySize = companySize
    if (industry !== undefined) updateData.industry = industry
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar
    if (institutionName !== undefined) updateData.institutionName = institutionName
    if (studentId !== undefined) updateData.studentId = studentId
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear
    if (degree !== undefined) updateData.degree = degree
    if (major !== undefined) updateData.major = major
    if (taxId !== undefined) updateData.taxId = taxId
    if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber
    if (businessType !== undefined) updateData.businessType = businessType

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        phoneNumber: true,
        website: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        preferredLanguage: true,
        timezone: true,
        companyName: true,
        companySize: true,
        industry: true,
        jobTitle: true,
        bio: true,
        avatar: true,
        institutionName: true,
        studentId: true,
        graduationYear: true,
        degree: true,
        major: true,
        taxId: true,
        registrationNumber: true,
        businessType: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
