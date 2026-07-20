<template>
  <div
    class="bg-[linear-gradient(135deg,oklch(11%_0.02_250)_0%,oklch(14%_0.03_260)_40%,oklch(12%_0.025_240)_100%)] flex items-center justify-center min-h-screen p-6 before:fixed before:inset-0 before:bg-[linear-gradient(oklch(100%_0_0/0.02)_1px,transparent_1px),linear-gradient(90deg,oklch(100%_0_0/0.02)_1px,transparent_1px)] before:bg-[size:64px_64px] before:pointer-events-none before:z-0 after:fixed after:top-[-20%] after:left-1/2 after:-translate-x-1/2 after:w-[800px] after:h-[600px] after:bg-[radial-gradient(ellipse,oklch(55%_0.18_255/0.08)_0%,transparent_70%)] after:pointer-events-none after:z-0"
  >
    <router-view class="relative z-10" />
  </div>
</template>
