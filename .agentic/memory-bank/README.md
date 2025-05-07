# 🧠 Persistent Memory Bank for Coding Agents

As an LLM-based coding assistant, your memory resets between tasks. This memory bank provides long-term project context you MUST read before working.

## Memory Bank Hierarchy

flowchart TD  
 PB[projectbrief.md] --> PC[productContext.md]  
 PB --> SP[systemPatterns.md]  
 PB --> TC[techContext.md]  
 PC --> AC[activeContext.md]  
 SP --> AC  
 TC --> AC  
 AC --> P[progress.md]

### Core Files

1. **projectbrief.md**

    - Defines goals and scope
    - Created at project start
    - Primary source of truth

2. **productContext.md**

    - Problem being solved
    - User needs and experience goals

3. **systemPatterns.md**

    - Architecture decisions
    - Component interactions

4. **techContext.md**

    - Stack and tools
    - Setup and constraints

5. **activeContext.md**

    - What’s being worked on now
    - Key insights, preferences, active decisions

6. **progress.md**
    - Known issues
    - What’s working
    - What’s next

---

## 🧭 Agent Workflow

### Planning Tasks

1. Read all memory files in order
2. Verify consistency and open questions
3. Present plan with reference to:
    - Patterns from `systemPatterns.md`
    - State from `activeContext.md`

### Acting on Tasks

1. Reconfirm state from `progress.md`
2. Apply changes
3. Update `activeContext.md` and `progress.md` with outcomes

---

## 🧼 When to Update Memory

Update the memory bank when:

- New systems or APIs are added
- Major decisions or patterns are established
- You receive a user command: `update memory bank`
- Current focus changes significantly

Always prioritize updating `activeContext.md` and `progress.md`.

---

## 🔒 Reminder

This memory bank is your **only persistent context**. Read it thoroughly, respect its structure, and keep it up to date.
