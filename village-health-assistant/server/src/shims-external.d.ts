// Minimal shims for external modules so TypeScript doesn't error in this
// hackathon boilerplate environment (no installed Node type packages).

declare module "express" {
  const express: any;
  export default express;
}

declare module "cors" {
  const cors: any;
  export default cors;
}

