import { runReviewWorkflow } from "../src/lib/workflow";

async function main() {
  const businessId = process.argv[2];
  const results = await runReviewWorkflow(businessId);
  console.log(JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
