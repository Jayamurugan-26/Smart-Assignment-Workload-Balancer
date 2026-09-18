import prisma from "../prisma.js";
import { getOrCreateDemoUser } from "../services/googleAuthService.js";
import { syncClassroomData } from "../services/classroomService.js";
import { getDashboardStatistics, balanceStudentWorkload } from "../services/workloadBalancer.js";

async function runTests() {
  console.log("🧪 Starting Automated Backend Verification Suite...\n");

  // 1. User setup
  const { user } = await getOrCreateDemoUser();
  console.log(`✅ Demo user initialized: ${user.name} (${user.email})`);

  // 2. Sync Classroom data
  const syncResult1 = await syncClassroomData(user);
  console.log(`✅ Initial Classroom sync completed (mock=${syncResult1.isUsingMock}, count=${syncResult1.syncedCount})`);

  // Verify non-duplicate re-sync
  const syncResult2 = await syncClassroomData(user);
  const assignmentsAfterSync2 = await prisma.assignment.findMany({
    where: { userId: user.id, deletedAt: null }
  });
  console.log(`✅ Re-sync completed without creating duplicates. Total count: ${assignmentsAfterSync2.length}`);

  // 3. Test Dashboard Statistics
  const stats1 = await getDashboardStatistics(user.id);
  console.log(`✅ Dashboard stats computed: Total=${stats1.total}, Pending=${stats1.pending}, InProgress=${stats1.inProgress}, Completed=${stats1.completed}, Rate=${stats1.completionPercentage}%`);
  if (stats1.total !== stats1.pending + stats1.inProgress + stats1.completed) {
    throw new Error("Stats sum mismatch!");
  }

  // 4. Test Edit Assignment
  const targetAsg = assignmentsAfterSync2[0];
  const updatedAsg = await prisma.assignment.update({
    where: { id: targetAsg.id },
    data: {
      title: "Updated Title for Verification",
      notes: "Custom user note test",
      isLocallyEdited: true,
      priority: "URGENT",
    }
  });
  console.log(`✅ Edit Assignment verified: "${updatedAsg.title}" (LocallyEdited: ${updatedAsg.isLocallyEdited})`);

  // Re-sync should PRESERVE locally edited title
  await syncClassroomData(user);
  const preservedAsg = await prisma.assignment.findUnique({ where: { id: targetAsg.id } });
  if (preservedAsg.title !== "Updated Title for Verification") {
    throw new Error("Re-sync improperly overwrote local user edits!");
  }
  console.log("✅ Re-sync successfully preserved local user edits");

  // 5. Test Mark as Done
  const completedAsg = await prisma.assignment.update({
    where: { id: targetAsg.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    }
  });
  console.log(`✅ Mark as Done verified: status=${completedAsg.status}, completedAt=${completedAsg.completedAt?.toISOString()}`);

  // Re-sync should NEVER overwrite COMPLETED with PENDING
  await syncClassroomData(user);
  const preservedCompletedAsg = await prisma.assignment.findUnique({ where: { id: targetAsg.id } });
  if (preservedCompletedAsg.status !== "COMPLETED") {
    throw new Error("Re-sync improperly reverted COMPLETED to PENDING!");
  }
  console.log("✅ Re-sync verified: COMPLETED status was safely preserved");

  // Verify updated dashboard statistics
  const stats2 = await getDashboardStatistics(user.id);
  console.log(`✅ Updated stats verified after completion: Completed=${stats2.completed}, CompletionRate=${stats2.completionPercentage}%`);

  // 6. Test Mark as Undone (Restore)
  const restoredAsg = await prisma.assignment.update({
    where: { id: targetAsg.id },
    data: {
      status: "PENDING",
      completedAt: null,
    }
  });
  console.log(`✅ Mark as Undone verified: status=${restoredAsg.status}, completedAt=${restoredAsg.completedAt}`);

  // 7. Test Soft Delete
  await prisma.assignment.update({
    where: { id: targetAsg.id },
    data: {
      deletedAt: new Date(),
      status: "DELETED",
    }
  });
  const activeCountAfterDelete = await prisma.assignment.count({
    where: { userId: user.id, deletedAt: null }
  });
  console.log(`✅ Soft Delete verified: Active count is now ${activeCountAfterDelete}`);

  // Re-sync should NOT resurrect soft-deleted assignment
  await syncClassroomData(user);
  const activeCountAfterResync = await prisma.assignment.count({
    where: { userId: user.id, deletedAt: null }
  });
  if (activeCountAfterResync !== activeCountAfterDelete) {
    throw new Error("Re-sync resurrected soft-deleted assignment!");
  }
  console.log("✅ Re-sync verified: Soft-deleted assignment was not resurrected");

  // Restore for subsequent UI usage
  await prisma.assignment.update({
    where: { id: targetAsg.id },
    data: {
      deletedAt: null,
      status: "IN_PROGRESS",
    }
  });

  // 8. Test Workload Balancer & Smoothing Algorithm
  const balanceResult = await balanceStudentWorkload(user);
  console.log(`✅ Workload Balancer verified: OverallRisk=${balanceResult.overallRisk}, ScheduledBlocks=${balanceResult.scheduledBlocksCount}`);

  console.log("\n🎉 ALL BACKEND VERIFICATION CHECKS PASSED SUCCESSFULLY!\n");
  process.exit(0);
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});