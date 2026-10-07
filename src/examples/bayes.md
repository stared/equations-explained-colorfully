# Bayes' Theorem

## Equation

$$
\mark[posterior]{P(H|E)} = \frac{\mark[likelihood]{P(E|H)} \mark[prior]{P(H)}}{\mark[evidence]{P(E)}}
$$

## Description

Your [updated belief]{.posterior} is your [prior view]{.prior} re-weighted by its [predictive power]{.likelihood} and normalized by the [total probability of the evidence]{.evidence}.

## .posterior

Posterior Probability $P(H|E)$.

What you believe *after* seeing the data. It is the probability of the Hypothesis ($H$) being true given the Evidence ($E$).

## .likelihood

Likelihood $P(E|H)$.

How well the hypothesis explains the data. It asks: "If my theory were true, how likely would this outcome be?" High likelihood means the theory strongly predicts the observed evidence.

## .prior

Prior Probability $P(H)$.

Your starting assumption *before* seeing new data. It represents base rates or previous knowledge.

## .evidence

Marginal Likelihood $P(E)$.

The probability of the evidence, averaged over possible hypotheses using their prior probabilities. Dividing by it makes the updated probabilities sum to one.
