# Bayes' Theorem

## Equation

$$
\mark[posterior]{P(H|E)} = \frac{\mark[likelihood]{P(E|H)} \mark[prior]{P(H)}}{\mark[evidence]{P(E)}}
$$

## Description

Your [updated belief]{.posterior} combines [what you knew before]{.prior} with [how well your hypothesis predicted the evidence]{.likelihood}. Better predictions earn more weight.

## .posterior

Posterior Probability $P(H|E)$.

What you believe *after* seeing the data. It is the probability of the Hypothesis ($H$) being true given the Evidence ($E$). This is the output of the learning process.

## .likelihood

Likelihood $P(E|H)$.

How well the hypothesis explains the data. It asks: "If my theory were true, how likely would this outcome be?" High likelihood means the theory strongly predicts the observed evidence.

## .prior

Prior Probability $P(H)$.

Your starting assumption *before* seeing new data. It represents base rates or previous knowledge. Evidence favors hypotheses that predicted it better than the alternatives.

## .evidence

Marginal Likelihood $P(E)$.

The probability of the evidence, averaged over possible hypotheses using their prior probabilities. Dividing by it makes the updated probabilities sum to one.
