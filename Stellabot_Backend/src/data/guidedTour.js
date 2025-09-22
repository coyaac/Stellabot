// src/data/guidedTour.js

// Guided flow based on the provided Q1–Q5 map
// Note: Step IDs are lowercase with underscores to match backend conventions.

const tour = {
    // Q1 – Start
    start: {
        text: "Hi! I’m Stella Bot. Which of these sounds most like you?",
        options: [
            { text: "I’m creating an online course to sell", nextStepId: "entrepreneur_intro" },
            { text: "I’m part of a Registered Training Organisation creating eLearning", nextStepId: "rto_intro" },
        ],
    },

    // Q2 – Entrepreneur branch
    entrepreneur_intro: {
        text: "What’s your biggest challenge right now?",
        options: [
            { text: "Designing and structuring content", nextStepId: "entrepreneur_challenge_content" },
            { text: "Engaging learners and building a course business", nextStepId: "entrepreneur_challenge_engagement" },
            { text: "Choosing the right tools and platforms", nextStepId: "entrepreneur_challenge_tools" },
        ],
    },

    // Q3a – Entrepreneur challenges
    entrepreneur_challenge_content: {
        text: "Tip: start with the end result you want learners to achieve, then build modules backwards from there.",
        options: [
            { text: "Show me The Stella Way", nextStepId: "entrepreneur_method" },
            { text: "Explore another challenge", nextStepId: "entrepreneur_intro" },
            { text: "Get personalised help", nextStepId: "unlock_email" },
        ],
    },
    entrepreneur_challenge_engagement: {
        text: "Tip: keep learners engaged with quick interactive activities every few minutes, and link them to real business outcomes.",
        options: [
            { text: "Show me The Stella Way", nextStepId: "entrepreneur_method" },
            { text: "Explore another challenge", nextStepId: "entrepreneur_intro" },
            { text: "Get personalised help", nextStepId: "unlock_email" },
        ],
    },
    entrepreneur_challenge_tools: {
        text: "Tip: start simple. Use a core platform and payment system, then add extras once you have traction.",
        options: [
            { text: "Show me The Stella Way", nextStepId: "entrepreneur_method" },
            { text: "Explore another challenge", nextStepId: "entrepreneur_intro" },
            { text: "Get personalised help", nextStepId: "unlock_email" },
        ],
    },

    // Q4 – Entrepreneur method
    entrepreneur_method: {
        text: "The Stella Way helps creators turn ideas into online courses ready to sell; balancing instructional design, learner engagement and the right tech.",
        options: [
            { text: "Get personalised help", nextStepId: "unlock_email" },
            { text: "Back to start", nextStepId: "start" },
        ],
    },

    // Q2 – RTO branch
    rto_intro: {
        text: "What’s your biggest challenge in transitioning training and assessment online?",
        options: [
            { text: "Converting training into eLearning content", nextStepId: "rto_challenge_content" },
            { text: "Managing compliance and assessments", nextStepId: "rto_challenge_compliance" },
            { text: "Using aXcelerate effectively", nextStepId: "rto_challenge_axcelerate" },
        ],
    },

    // Q3 – RTO challenges
    rto_challenge_content: {
        text: "Tip: bring content to life with scenarios and visuals that mirror learners’ real-world tasks.",
        options: [
            { text: "Show me The Stella Way", nextStepId: "rto_method" },
            { text: "Explore another challenge", nextStepId: "rto_intro" },
            { text: "Get personalised help", nextStepId: "unlock_email" },
        ],
    },
    rto_challenge_compliance: {
        text: "Tip: design assessments that collect digital evidence naturally, so compliance is built into the process.",
        options: [
            { text: "Show me The Stella Way", nextStepId: "rto_method" },
            { text: "Explore another challenge", nextStepId: "rto_intro" },
            { text: "Get personalised help", nextStepId: "unlock_email" },
        ],
    },
    rto_challenge_axcelerate: {
        text: "Tip: streamline aXcelerate by setting up workflows and learning plans that reduce admin and improve the student experience.",
        options: [
            { text: "Show me The Stella Way", nextStepId: "rto_method" },
            { text: "Explore another challenge", nextStepId: "rto_intro" },
            { text: "Get personalised help", nextStepId: "unlock_email" },
        ],
    },

    // Q4 – RTO method
    rto_method: {
        text: "The Stella Way helps RTOs design engaging, compliant eLearning and optimise systems like aXcelerate for smoother delivery.",
        options: [
            { text: "Get personalised help", nextStepId: "unlock_email" },
            { text: "Back to start", nextStepId: "start" },
        ],
    },

    // Q5 – Unlock email
    unlock_email: {
        text: "Want tailored advice for your exact situation? Enter your email to unlock my AI brain and get personalised feedback in real time; not just preset answers.",
        options: [
            { text: "Enter email", nextStepId: "AI_chat" },
            { text: "Not now", nextStepId: "start" },
        ],
    },
        // Safety: if AI_chat gets requested as a guided step, inform user about activation
        AI_chat: {
            text: "Great! Please enter your name and email to activate AI chat.",
            options: [
                { text: "Back to start", nextStepId: "start" },
            ],
        },
};

module.exports = tour;
