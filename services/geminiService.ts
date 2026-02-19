
import { GoogleGenAI, Type } from "@google/genai";
import { RoundData, FallacyType, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an educational game engine for "Group Project Chaos Manager". 
Generate interactive scenarios about identifying logical fallacies (Either/Or and Slippery Slope) in a student group chat.

CONFLICT REQUIREMENT:
Each round MUST include a series of 4-6 messages showing high tension, disagreement, and stress. 
One specific message MUST contain an Either/Or Fallacy or a Slippery Slope Fallacy.

INTERACTION MODEL:
When a player flags the fallacy message (❗), they must answer a Multiple Choice Question.
You must provide exactly 4 options for this question: 1 correct, 3 plausible distractors.

FORMAT:
ROUND SCENE:
[Name]: [Message]
...

FALLACY LOGIC:
Fallacy Type: [Either/Or or Slippery Slope]
Fallacy Location: [Exact text of the fallacious message]

MULTIPLE CHOICE QUESTION:
Question: [Why is this message fallacious?]
A. [Correct explanation - focused on reasoning structure] (CORRECT)
B. [Distractor - plausible reasoning error]
C. [Distractor - plausible reasoning error]
D. [Distractor - plausible reasoning error]

CONSEQUENCES:
- Correct Flag: [Feedback if they correctly flag and identify the fallacy]
- Wrong Flag: [Feedback if they flag it but pick the wrong explanation]
- Missed Flag: [Feedback if they click 👍 (neutral) on a fallacy message]
- Neutral Accepted: [Feedback if they click 👍 on a normal message]
`;

const INITIAL_ROUND: RoundData = {
  scene: [
    { sender: "Project Manager", text: "Hey @everyone, we only have one week left, and we don’t yet have a playable prototype for the demo." },
    { sender: "Project Manager", text: "Given the time constraint and the grading criteria, I think we should prioritize getting a working prototype in place and set aside the challenging integration of realistic 3D assets for now, which has been a bottleneck." },
    { sender: "Visual Lead", text: "I’m pushing for a realistic 3D style because it makes the game look professional." },
    { sender: "Project Manager", text: "But we are short on time." },
    { sender: "Visual Lead", text: "Either we push through and finish integrating my realistic 3D assets so the game looks professional, or we end up with a low-quality, amateur-looking demo. Which one do you want? @everyone" }
  ],
  fallacyType: FallacyType.EITHER_OR,
  fallacyLocation: "Either we push through and finish integrating my realistic 3D assets so the game looks professional, or we end up with a low-quality, amateur-looking demo. Which one do you want? @everyone",
  explanation: "This is an Either/Or fallacy because it presents only two extreme options while ignoring alternatives like using simplified assets or focusing on specific hero-pieces.",
  fallacyQuestion: {
    questionText: "What makes the Visual Lead's argument fallacious?",
    options: [
      { text: "It limits the group to only two extreme outcomes, ignoring middle-ground solutions.", isCorrect: true, explanation: "Correct! This is a classic False Dilemma." },
      { text: "It assumes that professional looks are the only thing that matters to a user.", isCorrect: false, explanation: "While this might be a biased perspective, it's not the structure of the fallacy itself." },
      { text: "It predicts that a single delay will cause the entire project to fail immediately.", isCorrect: false, explanation: "This would be a Slippery Slope, but the message doesn't establish a chain reaction." },
      { text: "It attacks the Project Manager's character rather than the timeline constraints.", isCorrect: false, explanation: "This would be an Ad Hominem, which isn't present here." }
    ]
  },
  consequences: {
    correctFlag: "Spot on! You called out the false dilemma. The group realizes they can use high-quality 2D assets or pre-made models instead of 3D bottlenecks.",
    wrongFlag: "You sensed something was wrong, but misidentified the logic. The group stays stuck in the argument.",
    missedFlag: "By accepting this false choice, you've committed the team to an impossible workload. Stress levels are peaking.",
    neutralAccepted: "You acknowledged the update. The conversation continues."
  }
};

const SECOND_ROUND: RoundData = {
  scene: [
    { sender: "Learning Engineer", text: "Our project mandate is clear—we must provide evidence of learning. Let us add quizzes." },
    { sender: "Game Designer", text: "That might distract and discourage players." },
    { sender: "Learning Engineer", text: "If we don’t accept the overhead of adding quizzes to the design, we end up with a study that has no interpretable learning data." },
    { sender: "Learning Engineer", text: "Since having no learning data isn’t an option for this project, let us add the quizzes and I am happy to take the lead on this." }
  ],
  fallacyType: FallacyType.EITHER_OR,
  fallacyLocation: "If we don’t accept the overhead of adding quizzes to the design, we end up with a study that has no interpretable learning data.",
  explanation: "This message presents an Either/Or fallacy by suggesting that the only two possibilities are adding full quizzes or having zero interpretable data, ignoring other assessment methods.",
  fallacyQuestion: {
    questionText: "Why is the Learning Engineer's argument about quizzes fallacious?",
    options: [
      { text: "It presents a false choice between adding quizzes and having no usable data at all.", isCorrect: true, explanation: "Correct! There are many ways to collect learning data without formal quizzes." },
      { text: "It assumes that quizzes will definitely result in discouraged players without proof.", isCorrect: false, explanation: "This is a prediction, but not the core structural fallacy of the argument presented." },
      { text: "It suggests that the project will be cancelled if quizzes aren't included.", isCorrect: false, explanation: "The message claims data will be missing, but it doesn't quite predict a total project collapse (Slippery Slope)." },
      { text: "It focuses on the 'overhead' of the quizzes rather than their educational value.", isCorrect: false, explanation: "This is a valid observation about the argument's content, but not a logical fallacy." }
    ]
  },
  consequences: {
    correctFlag: "Exactly! By flagging this, you open the door to discussing 'Stealth Assessment'—measuring learning through gameplay actions rather than disruptive quizzes.",
    wrongFlag: "You knew something was off, but the group is now arguing about player discouragement instead of finding better data solutions.",
    missedFlag: "The group reluctantly agrees to the quizzes. Playtesting scores drop as students find the interruptions annoying.",
    neutralAccepted: "The suggestion is noted, but the tension over the design remains unresolved."
  }
};

const THIRD_ROUND: RoundData = {
  scene: [
    { sender: "Game Developer", text: "Hi team, this major bug of the core mechanic really needs more time. I recommend that we defer tomorrow’s playtesting." },
    { sender: "Project Manager", text: "No, we shouldn’t." },
    { sender: "Game Developer", text: "I only need a few more hours to fix this, and I can find that time within the next two days given my other commitments. That would mean deferring playtesting by only two days, and we still have three weeks until the project deadline." },
    { sender: "Project Manager", text: "Shifting playtesting will squeeze the time left for everything that follows. Once the schedule starts getting postponed, feedback comes in too late for meaningful implementation, changes get rushed, and the final product will suffer." }
  ],
  fallacyType: FallacyType.SLIPPERY_SLOPE,
  fallacyLocation: "Shifting playtesting will squeeze the time left for everything that follows. Once the schedule starts getting postponed, feedback comes in too late for meaningful implementation, changes get rushed, and the final product will suffer.",
  explanation: "This is a Slippery Slope fallacy because it assumes that a single 2-day delay will trigger an inevitable, uncontrolled chain reaction leading to the failure of the entire project.",
  fallacyQuestion: {
    questionText: "How is the Project Manager's final response logically flawed?",
    options: [
      { text: "It predicts a chain reaction of increasingly severe consequences without sufficient evidence that the first step will cause them all.", isCorrect: true, explanation: "Correct! This is a classic Slippery Slope argument." },
      { text: "It forces the team to choose between only two options: playtest tomorrow or fail the project.", isCorrect: false, explanation: "While this is close, the message focuses on a sequence of events rather than a simple binary choice." },
      { text: "It ignores the fact that the developer is experienced and can handle tight deadlines.", isCorrect: false, explanation: "This is a point of disagreement, but not a logical fallacy in the structure of the argument." },
      { text: "It claims that the final product will suffer simply because the Project Manager is stressed.", isCorrect: false, explanation: "This would be an emotional appeal, but the text outlines a logical 'slope' of events." }
    ]
  },
  consequences: {
    correctFlag: "Brilliant! You recognized the slippery slope. The team calms down and realizes that a 48-hour shift is manageable and ensures a higher quality playtest.",
    wrongFlag: "You felt the tension, but misidentifying the logic keeps the team stuck in a loop of scheduling anxiety.",
    missedFlag: "By staying silent, you've allowed the PM's unfounded fear to force a buggy playtest. The results are messy and demoralizing.",
    neutralAccepted: "The debate over the schedule continues. The team is divided on whether the risk is real or imagined."
  }
};

export const generateRound = async (roundNumber: number): Promise<RoundData> => {
  if (roundNumber === 1) return INITIAL_ROUND;
  if (roundNumber === 2) return SECOND_ROUND;
  if (roundNumber === 3) return THIRD_ROUND;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Round ${roundNumber}. High tension conflict about deadlines or grades. One message must have a realistic fallacy (Either/Or or Slippery Slope).`,
    config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.9 },
  });

  return parseRoundData(response.text);
};

function parseRoundData(text: string): RoundData {
  try {
    const sceneMatch = text.match(/ROUND SCENE:([\s\S]*?)FALLACY LOGIC:/);
    const sceneText = sceneMatch ? sceneMatch[1].trim() : "";
    const scene: ChatMessage[] = sceneText.split('\n').filter(l => l.includes(':')).map(l => {
      const [s, ...m] = l.split(':');
      return { sender: s.trim(), text: m.join(':').trim() };
    });

    const fallacyLoc = text.match(/Fallacy Location:\s*(.*)/)?.[1].trim() || "";
    const fallacyTypeStr = text.match(/Fallacy Type:\s*(.*)/)?.[1].trim() || "";
    const fallacyType = fallacyTypeStr.toLowerCase().includes('either') ? FallacyType.EITHER_OR : FallacyType.SLIPPERY_SLOPE;

    const qText = text.match(/Question:\s*(.*)/)?.[1].trim() || "What is the logic error here?";
    const optionsRaw = text.match(/MULTIPLE CHOICE QUESTION:[\s\S]*?CONSEQUENCES:/)?.[0] || "";
    const options = optionsRaw.split('\n').filter(l => /^[A-D]\./.test(l)).map(l => ({
      text: l.replace(/^[A-D]\.\s*/, '').replace(/\(CORRECT\)/i, '').trim(),
      isCorrect: l.includes('(CORRECT)'),
      explanation: l.includes('(CORRECT)') ? "You've correctly identified the structural flaw in this reasoning." : "That's not quite it. Look closer at how the choices are framed."
    }));

    const consequences = {
      correctFlag: text.match(/- Correct Flag:\s*(.*)/)?.[1] || "Good job identifying the fallacy!",
      wrongFlag: text.match(/- Wrong Flag:\s*(.*)/)?.[1] || "You identified a problem but mislabeled it.",
      missedFlag: text.match(/- Missed Flag:\s*(.*)/)?.[1] || "You missed a serious logic error.",
      neutralAccepted: text.match(/- Neutral Accepted:\s*(.*)/)?.[1] || "You proceed with the chat."
    };

    return {
      scene,
      fallacyType,
      fallacyLocation: fallacyLoc,
      explanation: "Analysis of the logical structure used in the message.",
      fallacyQuestion: { questionText: qText, options },
      consequences
    };
  } catch (err) {
    console.error("Parse Error", err);
    return INITIAL_ROUND; // Fallback
  }
}
