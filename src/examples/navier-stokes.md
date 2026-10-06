# Navier-Stokes Equation

## Equation

$$
\mark[density]{\rho} \left( \mark[timederiv]{\frac{\partial \vec{v}}{\partial t}} + \mark[convection]{(\vec{v} \cdot \nabla) \vec{v}} \right) = \mark[pressure]{-\nabla p} + \mark[viscosity]{\mu \nabla^2 \vec{v}} + \mark[force]{\vec{f}}
$$

## Description

A fluid parcel accelerates under [pressure forces]{.pressure}, [viscous forces]{.viscosity}, and [body forces]{.force} such as gravity. Its acceleration combines [changes over time at a fixed location]{.timederiv} with [changes experienced as it moves through the flow]{.convection}. Multiplying this acceleration by the [mass density]{.density} gives the net force per unit volume.

This form describes an incompressible Newtonian fluid with constant dynamic viscosity. The velocity field must also have zero divergence.

## .density

Fluid density $\rho$ (mass per unit volume). Incompressible flow satisfies $\nabla \cdot \vec{v}=0$, so a moving fluid parcel keeps its volume.

It plays the role of mass in Newton's second law per unit volume. Under the same net force per unit volume, a denser fluid accelerates less. Gravity alone gives the same acceleration regardless of density, because its force per unit volume is $\rho \vec{g}$.

## .timederiv

Unsteady acceleration (local change).

Measures how the velocity changes at a fixed point in space over time. In steady flow, this term is zero, even if the fluid is moving fast or accelerating as it moves between locations.

## .convection

Convective acceleration (change due to movement).

This nonlinear term captures changes in a fluid parcel's speed or direction as it moves through a spatially varying velocity field (e.g., water speeding up as it enters a narrower pipe). It occurs even in steady, laminar flow and plays a central role in turbulence.

## .pressure

Pressure force per unit volume $-\nabla p$.

Pressure differences push fluid toward lower pressure. The negative sign makes this force point against the pressure increase. This does not determine the direction of motion: fluid can move toward higher pressure while slowing down, or remain at rest when other forces balance the pressure force.

## .viscosity

Viscous diffusion (internal friction).

The dynamic viscosity $\mu$ measures resistance to deformation, rather than to uniform motion. The term $\mu \nabla^2 \vec{v}$ is a force per unit volume that diffuses momentum, smoothing velocity differences. Turbulence depends on inertia relative to viscosity, as well as flow geometry and disturbances; viscosity alone does not determine whether a flow is turbulent.

## .force

Body force per unit volume $\vec{f}$.

Forces distributed through the fluid, such as gravity ($\rho \vec{g}$) or magnetic forces in a conducting fluid. In a rotating reference frame, this term can also include apparent forces such as the Coriolis force.
