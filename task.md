Red Health: Take-Home Assignment
📌 Title:
Design a Smart Discount Allocation Engine
🧭 Background:
You are tasked with designing a discount allocation system for a company that operates across
multiple locations. At each location, there is a fixed discount kitty (e.g., ₹10,000) that needs to
be distributed among the sales agents working at that location.
Each sales agent contributes in different ways — some have been around longer, some are
more active, and others are high performers. The challenge is to allocate the kitty in a way that
feels fair, explainable, and dynamic.
Your solution will be used as a foundation to automate this process across many such
locations.
🎯 Objective:
Build a program (CLI or script-based) that:
1. Accepts:
The total discount kitty (available money to be allocated)
A list of sales agents, with each agent having certain attributes
Optional configuration (e.g., min/max per agent)
2. Outputs:
A JSON object with:
■ The discount assigned to each sales agent
■ A brief justification for the assigned amount
3. Must ensure:
Total assigned does not exceed the available kitty
Allocation is data-driven and justifiable
Logic is clean, modular, and extensible
4. Should include:
Sample inputs & outputs
Basic unit tests (at least 3 scenarios)
A README.md with thought process and run instructions
📥 Input Format Example
{
"siteKitty": 10000,
"salesAgents": [
{
"id": "A1"
,
"performanceScore": 90,
"seniorityMonths": 18,
"targetAchievedPercent": 85,
"activeClients": 12
},
{
"id": "A2"
,
"performanceScore": 70,
"seniorityMonths": 6,
"targetAchievedPercent": 60,
"activeClients": 8
}
]
}
📘 Input Parameter Descriptions
Each sales agent object contains the following fields:
Field Name Description
id performanceScore seniorityMonths targetAchievedPercent activeClients Unique identifier for the sales agent
Agent's overall performance rating (0–100 scale)
Number of months the agent has been active with the company
Percentage of sales targets achieved (0–100%)
Number of currently active client accounts managed by the
agent
📤 Output Format Example
{
"allocations": [
{
"id": "A1"
,
"assignedDiscount": 6000,
"justification": "Consistently high performance and long-term contribution"
},
{
"id": "A2"
,
"assignedDiscount": 4000,
"justification": "Moderate performance with potential for growth"
}
]
}
💡 Hints to Guide Your Thinking:
●
Performance might signal reliability. Should a top performer get more?
●
Seniority could represent loyalty. Should long-timers receive extra credit?
●
Target achievement is a direct link to sales effectiveness. How do you reward this?
●
Active clients indicate current workload. Should higher responsibility earn more?
●
These parameters vary in range and meaning. Think about how to bring them to a
common scale (e.g., normalization).
●
You can design logic to assign base amounts first, then add variable bonuses based on
scores.
●
Consider adding minimum and maximum thresholds per agent — to ensure fairness
and usability.
●
What happens if all agents are exactly the same on all fields? Will your solution
behave well?
●
Avoid hardcoding logic where possible — your system should be future-proof and
tunable.
📦 Submission Checklist
1. ✅ Working code (any language)
2. ✅ Sample input/output
3. ✅ 3 test cases:
○
Normal case
○
All-same scores case
○
Rounding edge case
4. ✅ README.md with:
○
Your approach
○
Assumptions made
○
How to run the program
🧪 Evaluation Criteria
Area Weight
Fairness and clarity of logic 35%
Code structure and readability 20%
Extensibility and modular
design
20%
Handling of edge cases +
testing
15%
Documentation and justification 10%
✨ Bonus (Optional):
●
●
Configurable logic using JSON or environment variables
Ability to simulate different scenarios
●
Summary report with total allocated, remaining kitty (if any), and stats