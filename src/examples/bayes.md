# Bayes' Theorem

## Equation

$$
\mark[posterior]{P(H|E)} = \frac{\mark[likelihood]{P(E|H)} \mark[prior]{P(H)}}{\mark[evidence]{P(E)}}
$$

## Description

Your [updated belief]{.posterior} is your [prior view]{.prior} re-weighted by its [predictive power]{.likelihood} and normalized by the [total probability of the evidence]{.evidence}.

## .posterior

Posterior Probability $P(H|E)$.

What you believe *after* seeing the data. It is the probability of the Hypothesis ($H$) being true given the Evidence ($E$). This is the output of the learning process.

## .likelihood

Likelihood $P(E|H)$.

How well the hypothesis explains the data. It asks: "If my theory were true, how likely would this outcome be?" High likelihood means the theory strongly predicts the observed evidence.

## .prior

Prior Probability $P(H)$.

The probability assigned to a hypothesis *before* seeing the new data, based on base rates or previous knowledge. Evidence updates this probability according to how well the hypothesis predicts the observation compared with alternatives.

## .evidence

Marginal Likelihood $P(E)$.

The prior-weighted probability of the evidence across an exhaustive set of mutually exclusive hypotheses. It normalizes the posterior probabilities to sum to 1. Rare evidence need not cause a large update: if it is equally likely under every hypothesis, the probabilities remain unchanged. This formula requires $P(E)>0$.
