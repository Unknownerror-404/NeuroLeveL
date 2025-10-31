<p align="center">
  <img src="./NeuroLeveL/assets/Logo.png" width="300" alt="NeuroLeveL Logo" />
</p>

# NeuroLeveL
NeuroLeveL v1 introduces a novel, perceptron-inspired approach to leveling systems. Unlike traditional bots that rely on linear, static, or quadratic XP formulas, NeuroLeveL dynamically distributes XP based on both **recent server activity** and **user contribution ratios**.
Originally extracted from its parent bot **Jason**, this open-source module is now modularized for public use. It is fully customizable, allowing developers to adjust the behavior, scaling, and weighting logic to suit their own servers or bots.

## Features
- Activity-aware XP calculation
- Leveling system with scaling
- Leaderboard support
- MongoDB integration
- Dependent on user activity and participation relative to server activity.
- Encourages silent warriors while inherently discouraging spamming.
- Inbuilt spam control.

### Use Cases:
Perfect for Discord communities that want:
- Fairer engagement systems
- Anti-spam leveling
- Smarter reward logic based on real interaction

### Updates for 1.01.00 have been added! Supporting the following processes!
__Features Added__:
- ✅ Make the code more dynamic to mirror updating weights in a perceptron.
- ✅ Making xp required for succeeding levels follow similar perceptronic logic.
- ✅ Pull out the ports for tuning weights and biases to the discord chat region itself, rather than implicit tuning in the handler code.
---

### Updates for 1.02 are underway!
__Features to be added__:
- Adding contextual processing to the messages sent in discord channels.
- Adding relative scoring, hence any message improving user interactions by being supportive, communicative should lead to higher xp gains.
- Adding a message mood decider which decides current channel mood to be utilized for varying bot events (under work!).
- Adding latency to check involvement in terms of activity or interest.
---
