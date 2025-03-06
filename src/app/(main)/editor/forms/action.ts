"use server"

import openai from "@/lib/openai";
import { GenerateSummaryInput, generateSummarySchema } from "@/lib/validation";

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