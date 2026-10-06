# Navier-Stokes Equation

## Equation

$$
\mark[density]{\rho} \left( \mark[timederiv]{\frac{\partial \vec{v}}{\partial t}} + \mark[convection]{(\vec{v} \cdot \nabla) \vec{v}} \right) = \mark[pressure]{-\nabla p} + \mark[viscosity]{\mu \nabla^2 \vec{v}} + \mark[force]{\vec{f}}
$$

## Description

[Pressure]{.pressure} pushes fluid, [viscosity]{.viscosity} smooths differences in motion, and [gravity]{.force} pulls on it. [Denser fluid]{.density} needs a stronger push for the same acceleration.

## .density

Fluid density $\rho$ (mass per unit volume).

It acts as the "mass" term in $F=ma$. Under the same force per unit volume, denser fluids accelerate less.

## .timederiv

Unsteady acceleration (local change).

Watch one spot in a river: does the velocity there change with time? In steady flow, this term is zero, even if the water is moving fast.

## .convection

Convective acceleration (change due to movement).

Follow the fluid: it can speed up as it enters a narrower pipe, even if the flow at each spot stays steady. This term captures that change in velocity along its path.

## .pressure

Pressure gradient force.

Pressure differences push fluid toward lower pressure. The negative sign makes the force point _against_ the increase in pressure.

## .viscosity

Viscous diffusion (internal friction).

Internal friction smooths velocity differences between neighboring layers. Here $\mu$ is dynamic viscosity. This form assumes an incompressible Newtonian fluid with constant $\mu$.

## .force

Body forces per unit volume.

Forces that act on the bulk of the fluid, such as gravity ($\rho \vec{g}$), magnetic forces, or Coriolis forces when viewed in a rotating frame.
