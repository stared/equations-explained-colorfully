# Discrete Fourier Transform

## Equation

$$
\mark[amplitude]{X}_{\mark[freq]{k}} = \mark[average]{\frac{1}{N}} \mark[average]{\sum_{n=0}^{N-1}} \mark[signal]{x_n} \mark[spin]{e}^{\mark[spin]{i} \mark[circle]{2\pi} \mark[freq]{k} \mark[average]{\frac{n}{N}}}
$$

## Description

To find [the amplitude]{.amplitude} [at a particular frequency]{.freq}, [spin]{.spin} [your signal]{.signal} [around a circle]{.circle} [at that frequency]{.freq}, and [average a bunch of points along that path]{.average}.

## .amplitude

The transform output $X_k$. How strong frequency $k$ is in your signal, including magnitude and phase.

## .freq

The frequency index $k$. How fast to spin: one full rotation per $k$ cycles in the data.

## .average

The averaging operation $\frac{1}{N}\sum$. Center of mass of all the rotated signal points.

## .signal

The input signal $x_n$. Your data samples over time: audio, image, stock prices.

## .spin

The rotation operator $e^{i\theta}$. Uses complex numbers to rotate each sample, tracking both position and angle on a circle.

## .circle

The full circle constant $2\pi$. One full rotation in radians.
