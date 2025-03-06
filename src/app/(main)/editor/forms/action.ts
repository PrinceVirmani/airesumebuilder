"use server"

import openai from "@/lib/openai";
import { GenerateSummaryInput, generateSummarySchema, GenerateWorkExperienceInput, generateWorkExperienceSchema, WorkExperience } from "@/lib/validation";

export async function generateSummary(input: GenerateSummaryInput) {
    const { jobTitle, workExperiences, educations, skills } = generateSummarySchema.parse(input)

    const systemMessage = `You are a job resume generator AI. your task is to write a professional introduction summary for a resume given the user's provided data. only return the summary and do not include any other information in the response. keep it concise and professional
    `

    const userMessage = `Please generate a professional resume summary from this data: 
    Job title : ${jobTitle || "N/A"}
    Work Experience: ${workExperiences?.map(exp => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} froom ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}

        Description : ${exp.description || "N/A"}
        `).join("\n\n")}

    Education: ${educations?.map(edu => `
        Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} froom ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
        `).join("\n\n")}
    Skills: ${skills}
    `

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "system",
            content: systemMessage,
        }, {
            role: "user",
            content: userMessage
        }]
    })

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
        throw new Error("Failed to genereate AI response")
    }

    return aiResponse;
}

export async function generateWorkExperience(input: GenerateWorkExperienceInput) {
    const { description } = generateWorkExperienceSchema.parse(input);

    const systemMessage = `You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input. Your response must adhere to the following structure. You can omit fields if they can't be infered from the provided data, but don't add any new ones.
    
    Job title: <job title>
    Company: <company name>
    Start Date: <format: YYYY-MM-DD> (only if provided)
    End Date: <format: YYYY-MM-DD> (only if provided)
    Description: <an optimized description in bullet format, might be infered from the job title>

    `

    const userMessage = `
    Please provide a work experience from this description: 
    ${description}
    `

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "system",
            content: systemMessage,
        }, {
            role: "user",
            content: userMessage
        }]
    })

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
        throw new Error("Failed to genereate AI response")
    }


    return {
        position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
        company: aiResponse.match(/Company: (.*)/)?.[1] || "",
        description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
        startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
        endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
    } satisfies WorkExperience

}