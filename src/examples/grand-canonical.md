# Grand Canonical Ensemble

## Equation

$$
\mark[prob]{P_i} = \frac{1}{\mark[partition]{\mathcal{Z}}} \mark[weight]{e}^{-\frac{\mark[energy]{E_i} - \mark[chempot]{\mu}\mark[particles]{N_i}}{\mark[temp]{k_B T}}}
$$

## Description

The [probability]{.prob} is determined by the [Boltzmann weight]{.weight}: states with lower [energy]{.energy} are more likely, while the [chemical potential]{.chempot} encourages adding [particles]{.particles}. The [temperature]{.temp} scales these effects, and the [partition function]{.partition} normalizes the result.

## .prob

Probability ($P_i$).

The fraction of time the system spends in this specific microstate.

## .partition

Grand Partition Function ($\mathcal{Z}$).

The sum of weights over all possible states. It ensures that all probabilities add up to exactly 1.

## .weight

Boltzmann Factor.

The relative likelihood of the state. The negative sign in the exponent means that states with higher effective energy are exponentially less probable.

## .energy

State Energy ($E_i$).

The mechanical energy of the specific configuration (e.g., kinetic + potential).

## .chempot

Chemical Potential ($\mu$).

The change in energy when adding a particle. It acts like a "voltage" for matter—particles flow from high $\mu$ to low $\mu$.

## .particles

Particle Number ($N_i$).

The number of atoms or molecules in the current state. In this ensemble, this number fluctuates as the system exchanges matter with a reservoir.

## .temp

Thermal Energy ($k_B T$).

The average energy of random thermal motion. It acts as the denominator, meaning high temperatures "wash out" the differences between energy states.
