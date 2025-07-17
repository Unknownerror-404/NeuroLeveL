### Update Notes / Dev logs:
- *version update* 1.01.0 : Updated the weights of logical perceptron to depend on user and msg ratios, and pass it through a sigmoid function to clamp it between 0 to 1, the values are changable but have been set to some random default values. This makes the code more dynamic and reactive when compared to the earlier hardcoded weights. Finally the product is also passed through a Relu function to nulify any chances of distributing zero xp, hence clamping is done between 3 and the product value.
---
