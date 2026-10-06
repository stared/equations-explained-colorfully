# Schrödinger Equation

## Equation

$$
\mark[imaginary]{i}\mark[planck]{\hbar} \mark[timederiv]{\frac{\partial}{\partial t}} \mark[wavefunction]{\psi(x,t)} = \mark[kinetic]{-\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2}} \mark[wavefunction]{\psi(x,t)} + \mark[potential]{V(x)} \mark[wavefunction]{\psi(x,t)}
$$

## Description

The [time evolution]{.timederiv} of the [quantum state]{.wavefunction} is determined by its total energy: the [kinetic energy]{.kinetic} (derived from spatial curvature) plus the [potential energy]{.potential}. The [imaginary unit]{.imaginary} drives the wave's oscillation, while the [reduced Planck constant]{.planck} sets the scale of quantum action.

This is the one-dimensional, nonrelativistic equation for a particle in a time-independent potential.

## .imaginary

The imaginary unit $i = \sqrt{-1}$ is essential to quantum mechanics.

The factor $i$ turns the energy-dependent evolution into changes of complex phase. With a self-adjoint Hamiltonian, this gives unitary evolution and conserves total probability. Relative phases between components of the state determine interference.

## .planck

The reduced Planck constant $\hbar = h/2\pi$.

It sets the characteristic scale of quantum action; action is not universally restricted to integer multiples of $\hbar$. It connects energy to frequency ($E = \hbar\omega$) and momentum to wavenumber ($p = \hbar k$).
**Value:** $\approx 1.055 \times 10^{-34}$ J·s.

## .timederiv

The rate of change of the wavefunction over time.

This derivative describes how the state evolves. The equation equates $i\hbar\,\partial\psi/\partial t$ with the Hamiltonian acting on the state, $\hat{H}\psi$. The Hamiltonian is the total-energy operator, not generally a single energy value.

## .kinetic

The kinetic energy operator.

In classical mechanics, $E_k = p^2 / 2m$. In quantum mechanics, momentum is an operator $\hat{p} = -i\hbar \frac{\partial}{\partial x}$. Squaring this and dividing by $2m$ gives the term $-\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2}$. The second derivative measures the wavefunction's spatial curvature. Shorter-wavelength Fourier components have larger momentum magnitude and kinetic energy; an arbitrary state need not have a single momentum or energy.

## .potential

The potential energy function $V(x)$.

This represents the environment the particle moves in, such as an electron in an electric field or a particle in a box. It acts as a simple multiplicative factor at each point in space.

## .wavefunction

The wavefunction $\psi(x,t)$, a complex-valued probability amplitude.

It contains all measurable information about the particle. For a normalized wavefunction, $|\psi(x,t)|^2$ is the probability density at position $x$. The probability of finding the particle in an interval $[a,b]$ is $\int_a^b |\psi(x,t)|^2\,dx$.
