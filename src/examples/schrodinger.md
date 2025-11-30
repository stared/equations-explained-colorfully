# Schrödinger Equation

## Equation

$$
\mark[imaginary]{i}\mark[planck]{\hbar} \mark[timederiv]{\frac{\partial}{\partial t}} \mark[wavefunction]{\psi(x,t)} = \mark[kinetic]{-\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2}} \mark[wavefunction]{\psi(x,t)} + \mark[potential]{V(x)} \mark[wavefunction]{\psi(x,t)}
$$

## Description

The [time evolution]{.timederiv} of the [quantum state]{.wavefunction} is determined by its total energy: the [kinetic energy]{.kinetic} (derived from spatial curvature) plus the [potential energy]{.potential}. The [imaginary unit]{.imaginary} drives the wave's oscillation, while [Planck's constant]{.planck} sets the scale of quantum action.

## .imaginary

The imaginary unit $i = \sqrt{-1}$ is essential to quantum mechanics.

It causes the wavefunction to rotate in the complex plane rather than just grow or shrink. This rotation manifests as wave-like interference and ensures that the total probability remains conserved (unitary evolution).

## .planck

The reduced Planck constant $\hbar = h/2\pi$.

It represents the fundamental quantum of action, setting the scale at which quantum effects become significant. It connects energy to frequency ($E = \hbar\omega$) and momentum to wavenumber ($p = \hbar k$).
**Value:** $\approx 1.055 \times 10^{-34}$ J·s.

## .timederiv

The rate of change of the wavefunction over time.

This derivative describes how the state evolves. The $i\hbar$ factor turns this rate of change into an energy term (the Hamiltonian), linking time evolution directly to the system's total energy.

## .kinetic

The kinetic energy operator.

In classical mechanics, $E_k = p^2 / 2m$. In quantum mechanics, momentum is an operator $\hat{p} = -i\hbar \frac{\partial}{\partial x}$. Squaring this gives the term $-\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2}$. It measures the curvature of the wave: sharper curves mean higher momentum and higher kinetic energy.

## .potential

The potential energy function $V(x)$.

This represents the environment the particle moves in, such as an electron in an electric field or a particle in a box. It acts as a simple multiplicative factor at each point in space.

## .wavefunction

The wavefunction $\psi(x,t)$, a complex-valued probability amplitude.

It contains all measurable information about the particle. The probability of finding the particle at position $x$ is given by the Born rule: $P(x) = |\psi(x,t)|^2$.
