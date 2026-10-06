# Shannon Entropy

## Equation

$$
\mark[entropy]{H} = \mark[average]{\sum_{i}} \mark[prob]{p(x_i)} \left(\mark[bits]{-\log_2 p(x_i)}\right)
$$

## Description

[Rare outcomes]{.prob} carry [more information]{.bits}. [Entropy]{.entropy} is how much you learn from an outcome, [on average]{.average}.

## .entropy

Shannon Entropy $H$. Average surprise per message. High entropy = randomness, low entropy = predictability.

## .average

Summation $\sum_i$. Adds up the contributions from all outcomes; the probabilities turn this into a weighted average.

## .prob

Probability $p(x_i)$. How likely each outcome is. A rare outcome is more surprising, but contributes less often to the average.

## .bits

Surprise $-\log_2 p$. Information content in bits. Probability $1/2$ = 1 bit, $1/8$ = 3 bits. Rarer events are more informative.
