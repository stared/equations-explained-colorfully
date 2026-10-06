# Grand Canonical Ensemble

## Equation

$$
\mark[prob]{P_i} = \frac{1}{\mark[partition]{\mathcal{Z}}} \mark[weight]{e}^{-\frac{\mark[energy]{E_i} - \mark[chempot]{\mu}\mark[particles]{N_i}}{\mark[temp]{k_B T}}}
$$

## Description

For the same [particle count]{.particles}, lower-[energy]{.energy} states are [more likely]{.prob}. [Heating]{.temp} weakens that preference; raising the [chemical potential]{.chempot} favors taking in more particles.

## .prob

Probability ($P_i$).

The equilibrium probability of this specific microstate.

## .partition

Grand Partition Function ($\mathcal{Z}$).

The sum of weights over all possible states. It ensures that all probabilities add up to exactly 1.

## .weight

Boltzmann Factor.

The relative likelihood of the state. At positive temperature, a higher effective energy $E_i-\mu N_i$ makes a state exponentially less probable.

## .energy

State Energy ($E_i$).

The mechanical energy of the specific configuration (e.g., kinetic + potential).

## .chempot

Chemical Potential $\mu$. The free-energy cost of adding one particle at fixed temperature and volume. Particles flow from high $\mu$ to low $\mu$ until equilibrium.

## .particles

Particle Number ($N_i$).

The number of atoms or molecules in the current state. In this ensemble, this number fluctuates as the system exchanges matter with a reservoir.

## .temp

Thermal Energy ($k_B T$).

The characteristic energy scale of thermal motion. It acts as the denominator, meaning high temperatures "wash out" the differences between energy states.
