# Discrete Fourier Transform

## Equation

$$
\mark[frequency]{X_k} = \mark[average]{\frac{1}{N}} \mark[sum]{\sum_{n=0}^{N-1}} \mark[signal]{x_n} \mark[spin]{e^{-i2\pi k \frac{n}{N}}}
$$

## Description

To find [the energy at a particular frequency]{.frequency}, [spin]{.spin} [your signal]{.signal} [around a circle at that frequency]{.spin}, and [average]{.average} [a bunch of points along that path]{.sum}.

## .frequency

The frequency domain representation ($X_k$).

This value represents how much of the original signal is composed of frequency $k$. If the magnitude $|X_k|$ is large, it means that frequency is a dominant part of the signal (like a strong bass note in a song).

## .average

Normalization factor ($1/N$).

Just like calculating a mean, we divide by the number of samples $N$ to keep the scale consistent. This turns the sum into an average.

## .sum

Summation over time.

We add up the contribution of every point in the signal. This step accumulates the "matching" between the signal and the rotating frequency.

## .signal

The input signal ($x_n$).

This is your data over time—like an audio recording or a stock price history. It is a sequence of $N$ discrete points, indexed by $n$.

## .spin

Complex rotation ($e^{-i\theta}$).

This term wraps the signal around the complex plane. As $n$ increases, the angle rotates. If the rotation speed ($k$) matches a pattern in the signal ($x_n$), the points line up and add constructively; otherwise, they cancel out.

