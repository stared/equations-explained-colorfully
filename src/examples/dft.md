# Discrete Fourier Transform

## Equation

$$
\mark[amplitude]{X}_{\mark[freq]{k}} = \mark[average]{\frac{1}{N}} \mark[average]{\sum_{n=0}^{N-1}} \mark[signal]{x_n} \mark[spin]{e}^{\mark[spin]{i} \mark[circle]{2\pi} \mark[freq]{k} \frac{n}{N}}
$$

## Description

To find [the amplitude]{.amplitude} [at a particular frequency]{.freq}, [spin]{.spin} [your signal]{.signal} [around a circle]{.circle} [at that frequency]{.freq}, and [average a bunch of points along that path]{.average}.

Adapted from Stuart Riffle’s [Understanding the Fourier Transform](https://web.archive.org/web/20130318211259/http://www.altdevblogaday.com/2011/05/17/understanding-the-fourier-transform).

## .amplitude

The transform output $X_k$. How strong frequency $k$ is in your signal, including magnitude and phase.

## .freq

The frequency index $k$. How fast to spin: $k$ full rotations over the $N$ samples.

## .average

The averaging operation $\frac{1}{N}\sum$. Center of mass of all the rotated signal points.

## .signal

The input signal $x_n$. Your data samples over time: audio, image, stock prices.

## .spin

The rotation operator $e^{i\theta}$. Rotates each sample without changing its magnitude.

## .circle

The full circle constant $2\pi$. One full rotation in radians.
