"use server"

import prisma from "@/lib/prisma";
import { resumeSchema, ResumeVlaues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob"
import { access } from "fs";
import path from "path";


export async function saveResume(values: ResumeVlaues) {
    const { id } = values;

    const { photo, workExperiences, educations, ...resumeValues } = resumeSchema.parse(values);

    const { userId } = await auth()

    if (!userId) {
        throw new Error("User not authenticated")
    }

    const existingResume = id ? await prisma.resume.findUnique({ where: { id, userId } }) : null

    if (id && !existingResume) {
        throw new Error("Resume not found")
    }

    let newPhotoUrl: string | undefined | null = undefined;

    if (photo instanceof File) {
        if (existingResume?.photoUrl) {
            await del(existingResume.photoUrl)
        }

        const blob = await put(`resume_photos/${path.extname(photo.name)}`, photo, {
            access: "public"
        })


        newPhotoUrl = blob.url
    }
    else if (photo === null) {
        if (existingResume?.photoUrl) {
            await del(existingResume.photoUrl)
        }
        newPhotoUrl = null
    }

    if (id) {
        return prisma.resume.update({
            where: { id },
            data: {
                ...resumeValues,
                photoUrl: newPhotoUrl !== undefined ? newPhotoUrl : undefined,
                skills: resumeValues.skills?.filter(Boolean) as string[] || [],
                WorkExperience: {
                    deleteMany: {
                        resumeId: id  // Specify which records to delete
                    },
                    create: workExperiences?.map(exp => ({
                        position: exp.position,
                        company: exp.company,
                        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
                        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
                        description: exp.description
                    })) || []  // Handle undefined with empty array
                },
                Education: {
                    deleteMany: {
                        resumeId: id  // Specify which records to delete
                    },
                    create: educations?.map(edu => ({
                        degree: edu.degree,
                        school: edu.school,
                        startDate: edu.startDate ? new Date(edu.startDate) : undefined,
                        endDate: edu.endDate ? new Date(edu.endDate) : undefined
                    })) || []  // Handle undefined with empty array
                },
                updatedAt: new Date(),
            }
        })
    } else {
        return prisma.resume.create({
            data: {
                ...resumeValues,
                userId,
                photoUrl: newPhotoUrl,
                skills: resumeValues.skills?.filter(Boolean) as string[] || [],  // Ensure skills is an array of non-undefined strings
                WorkExperience: {
                    create: workExperiences?.map(exp => ({
                        position: exp.position,
                        company: exp.company,
                        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
                        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
                        description: exp.description
                    })) || []  // Handle undefined with empty array
                },
                Education: {
                    create: educations?.map(edu => ({
                        degree: edu.degree,
                        school: edu.school,
                        startDate: edu.startDate ? new Date(edu.startDate) : undefined,
                        endDate: edu.endDate ? new Date(edu.endDate) : undefined
                    })) || []  // Handle undefined with empty array
                }
            }
        })
    }
}
