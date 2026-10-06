# Grand Canonical Ensemble

## Equation

$$
\mark[prob]{P_i} = \frac{1}{\mark[partition]{\mathcal{Z}}} \mark[weight]{e}^{-\frac{\mark[energy]{E_i} - \mark[chempot]{\mu}\mark[particles]{N_i}}{\mark[temp]{k_B T}}}
$$

## Description

Each microstate's [probability]{.prob} is set by its [Boltzmann weight]{.weight}: at positive temperature, states with a smaller value of [energy]{.energy} minus [chemical potential]{.chempot} times [particle number]{.particles} receive greater weight. The [thermal energy scale]{.temp} sets how strongly these differences matter, and the [partition function]{.partition} normalizes the probabilities.

This ensemble describes equilibrium with a reservoir that exchanges energy and particles with the system, setting its temperature and chemical potential at fixed volume.

## .prob

Probability ($P_i$).

The equilibrium probability of this specific microstate. It can also be interpreted as a long-run fraction of time when the dynamics sample the equilibrium ensemble.

## .partition

Grand Partition Function ($\mathcal{Z}$).

The sum of weights over all possible states. It ensures that all probabilities add up to exactly 1.

## .weight

Boltzmann Factor.

The full exponential $e^{-(E_i-\mu N_i)/(k_B T)}$ gives the state's unnormalized weight. At positive temperature, higher $E_i-\mu N_i$ means exponentially smaller weight. For states with equal particle number, lower energy means higher probability.

## .energy

State Energy ($E_i$).

The mechanical energy of the specific configuration (e.g., kinetic + potential).

## .chempot

Chemical potential $\mu$. The change in Helmholtz free energy per added particle at fixed temperature and volume. Increasing the reservoir's chemical potential favors states with more particles. At thermal equilibrium, exchange of particles tends to equalize chemical potentials.

## .particles

Particle Number ($N_i$).

The number of atoms or molecules in the current state. In this ensemble, this number fluctuates as the system exchanges matter with a reservoir.

## .temp

Thermal Energy ($k_B T$).

The characteristic thermal energy scale, with Boltzmann constant $k_B$ and absolute temperature $T$. It is not generally the average kinetic energy. At fixed chemical potential and microstate energies, a larger positive temperature makes the relative weights less sensitive to differences in $E_i-\mu N_i$.
