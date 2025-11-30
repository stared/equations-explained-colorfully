# Discrete Fourier Transform

## Equation

$$
\mark[amplitude]{X}_{\mark[freq]{k}} = \mark[average]{\frac{1}{N}} \mark[average]{\sum_{n=0}^{N-1}} \mark[signal]{x_n} \mark[spin]{e}^{\mark[spin]{i} \mark[circle]{2\pi} \mark[freq]{k} \mark[average]{\frac{n}{N}}}
$$

## Description

To find [the amplitude]{.amplitude} [at a particular frequency]{.freq}, [spin]{.spin} [your signal]{.signal} [around a circle]{.circle} [at that frequency]{.freq}, and [average a bunch of points along that path]{.average}.

## .amplitude

The transform output $X_k$.

Represents the **complex amplitude** (magnitude and phase) of the signal at a specific frequency. Its magnitude tells you "how much" of that frequency is present.

## .freq

The frequency index $k$.

Determines which frequency we are analyzing. It appears both in the output index (which bin?) and in the rotation term (how fast do we spin?).

## .average

The averaging operation.

Combines the summation ($\sum$) and the division by $N$ (and the time index term $\frac{n}{N}$). It turns the sum into an average value over the signal's duration.

## .signal

The input signal $x_n$.

Your raw data points (audio, image, stock prices) sampled over time.

## .spin

The exponential term $e^i$.

This is the rotation operator basis.

## .circle

The full circle constant $2\pi$.

Represents one full rotation in radians.
