# Discrete Fourier Transform

## Equation

$$
\mark[amplitude]{X}_{\mark[freq]{k}} = \mark[average]{\frac{1}{N}} \mark[average]{\sum_{n=0}^{N-1}} \mark[signal]{x_n} \mark[spin]{e}^{\mark[spin]{i} \mark[circle]{2\pi} \mark[freq]{k} \frac{n}{N}}
$$

## Description

To find [the complex amplitude]{.amplitude} [at a particular frequency index]{.freq}, [rotate]{.spin} each [signal sample]{.signal} through an angle based on its position in the data, with [a full turn]{.circle} equal to 2π radians. Then [average the rotated samples]{.average}.

This convention uses a positive exponent and a 1/N normalization. Many software libraries use this convention for the inverse DFT and a negative exponent for the forward DFT.

## .amplitude

The transform output $X_k$. How strong frequency $k$ is in your signal, including magnitude and phase.

## .freq

The frequency index $k$. The rotation factor makes $k$ full turns across the $N$ equally spaced samples: sample $n$ is rotated by $2\pi kn/N$ radians. The index labels a frequency bin, not a frequency in hertz.

## .average

The averaging operation $\frac{1}{N}\sum$. Center of mass of all the rotated signal points.

## .signal

The input signal $x_n$. A sequence of $N$ equally spaced samples, such as audio samples over time or image values along a row.

## .spin

The rotation factor $e^{i\theta}$. Multiplication by this complex number rotates a sample through angle $\theta$ without changing its magnitude. Different sample magnitudes give different distances from the origin.

## .circle

The full circle constant $2\pi$. One full rotation in radians.
