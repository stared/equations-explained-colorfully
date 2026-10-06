# Navier-Stokes Equation

## Equation

$$
\mark[density]{\rho} \left( \mark[timederiv]{\frac{\partial \vec{v}}{\partial t}} + \mark[convection]{(\vec{v} \cdot \nabla) \vec{v}} \right) = \mark[pressure]{-\nabla p} + \mark[viscosity]{\mu \nabla^2 \vec{v}} + \mark[force]{\vec{f}}
$$

## Description

Fluid accelerates ([over time]{.timederiv} and [along paths]{.convection}) due to [pressure]{.pressure}, [viscosity]{.viscosity}, and [external forces]{.force}. Its [density]{.density} sets how readily it accelerates.

## .density

Fluid density $\rho$ (mass per unit volume).

It acts as the "mass" term in $F=ma$. Under the same force per unit volume, denser fluids accelerate less.

## .timederiv

Unsteady acceleration (local change).

Measures how the velocity changes at a fixed point in space over time. If the flow is steady, this term is zero, even if the water is moving fast.

## .convection

Convective acceleration (change due to movement).

This non-linear term captures how fluid particles accelerate as they move to a region with different velocity (e.g., water speeding up as it enters a narrow pipe). It occurs even in steady, smooth flow and plays a central role in turbulence.

## .pressure

Pressure gradient force.

Pressure differences push fluid toward lower pressure. The negative sign makes the force point _against_ the increase in pressure.

## .viscosity

Viscous diffusion (internal friction).

Internal friction smooths velocity differences between neighboring layers. Here $\mu$ is dynamic viscosity. This form assumes an incompressible Newtonian fluid with constant $\mu$.

## .force

Body forces per unit volume.

Forces that act on the bulk of the fluid, such as gravity ($\rho \vec{g}$), magnetic forces, or Coriolis forces when viewed in a rotating frame.
