"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

type User = {
  id: string;
  email: string;
  displayName: string;
  plan: string;
  aiUsageThisPeriod: number;
  createdAt: string;
};

type PlayerCharacter = {
  id?: string;
  _id?: string;
  name: string;
  race: string;
  class: string;
  level: number;
  maxHp: number;
};

type MeResponse = {
  success: boolean;
  data?: { user: User };
  error?: string;
};

type PCsResponse = {
  success: boolean;
  data?: PlayerCharacter[];
  error?: string;
};

type CampaignStatus = "in-progress" | "not-started";

type Campaign = {
  id?: string;
  _id?: string;
  title: string;
  shortDescription?: string;
  status: CampaignStatus; // ✅ add status so filter compiles
  worldId?:
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | string;
  tags?: string[];
  isPaid?: boolean;
  visibility?: string;
};

type PlayerTab = "characters" | "campaigns" | "accomplishments" | "completed";

export default function PlayerHubPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<PlayerTab>("characters");
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completedCampaigns, setCompletedCampaigns] = useState<Campaign[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<CampaignStatus>("in-progress");
  const [allOwnedCampaigns] = useState<Campaign[]>([]); // TODO: load real data

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const meRes = await fetch(apiUrl("/api/auth/me"), {
          credentials: "include",
        });
        const meJson: MeResponse = await meRes.json();

        if (!meRes.ok || !meJson.success || !meJson.data?.user) {
          router.push("/login");
          return;
        }

        setUser(meJson.data.user);

        const pcsRes = await fetch(apiUrl("/api/player-characters/mine"), {
          credentials: "include",
        });
        const pcsJson: PCsResponse = await pcsRes.json();

        if (pcsJson.success && pcsJson.data) {
          setCharacters(pcsJson.data);
        } else if (pcsJson.error) {
          setError(pcsJson.error);
        }
      } catch (err) {
        console.error("Player hub load error", err);
        setError("Failed to load player data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading && !user) {
    return (
      <main className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Player Hub</h1>
        <p className="text-sm text-slate-300">Loading your data...</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg space-y-6">
      <header className="border-b border-slate-800 pb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Player Hub</h1>
          {user && (
            <p className="text-sm text-slate-300">
              Signed in as <span className="font-mono">{user.email}</span> ({user.plan})
            </p>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-800 mb-4">
        <nav className="flex flex-wrap gap-2 text-xs sm:text-sm">
          {[
            { id: "characters", label: "My Characters" },
            { id: "campaigns", label: "My Active Campaigns" },
            { id: "accomplishments", label: "My Accomplishments" },
            { id: "completed", label: "My Completed Campaigns" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as PlayerTab)}
              className={`px-3 py-1.5 rounded-t-md border-b-2 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-slate-100"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Characters tab */}
      {activeTab === "characters" && (
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">My Characters</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log("TODO: open Create Character flow");
                }}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Create Character
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("TODO: navigate to Marketplace Characters");
                }}
                className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
              >
                Browse Marketplace Characters
              </button>
            </div>
          </div>

          {characters.length === 0 ? (
            <p className="text-sm text-slate-400">
              You have no player characters yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {characters.map((pc) => (
                <li
                  key={pc.id || pc._id}
                  className="rounded border border-slate-800 bg-slate-950 px-3 py-2"
                >
                  <div className="font-medium">
                    {pc.name} – {pc.race} {pc.class}
                  </div>
                  <div className="text-xs text-slate-400">
                    Level {pc.level}, {pc.maxHp} HP
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Active campaigns tab */}
      {activeTab === "campaigns" && (
				<section>
					{/* Header with toggle + marketplace button */}
					<div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-1">
							<h2 className="text-lg font-semibold">My Active Campaigns</h2>
							<p className="text-xs text-slate-400">
								Jump back into your current adventures, or kick off something brand new from your library.
							</p>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
							{/* In Progress / Not Started toggle */}
							<div className="inline-flex rounded-md border border-slate-700 bg-slate-950 p-0.5 text-xs">
								<button
									type="button"
									onClick={() => setCampaignFilter("in-progress")}
									className={
										"px-3 py-1 rounded-[3px] " +
										(campaignFilter === "in-progress"
											? "bg-indigo-600 text-white"
											: "text-slate-300 hover:bg-slate-800")
									}
								>
									In Progress
								</button>
								<button
									type="button"
									onClick={() => setCampaignFilter("not-started")}
									className={
										"px-3 py-1 rounded-[3px] " +
										(campaignFilter === "not-started"
											? "bg-indigo-600 text-white"
											: "text-slate-300 hover:bg-slate-800")
									}
								>
									Not Started
								</button>
							</div>

							{/* Browse Marketplace Campaigns */}
							<button
								type="button"
								onClick={() => {
									// TODO: route to your marketplace page, e.g. router.push("/marketplace/campaigns");
								}}
								className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-white"
							>
								Browse Marketplace Campaigns
							</button>
						</div>
					</div>

					{/* Coming soon explanation */}
					<div className="mb-4 rounded-md border border-dashed border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400">
						<span className="font-medium text-slate-200">Coming soon:</span>{" "}
						You’ll be able to sync campaigns you own across worlds, auto-track your party’s progress,
						and unlock story tools that help you turn great sessions into great stories.
					</div>

					{/* Filtered list */}
					{allOwnedCampaigns.filter((c) => c.status === campaignFilter).length === 0 ? (
						<p className="text-sm text-slate-400">
							You don’t have any campaigns in this state yet. Start one from your library or grab a new
							adventure from the marketplace.
						</p>
					) : (
						<ul className="space-y-2">
							{allOwnedCampaigns
								.filter((c) => c.status === campaignFilter)
								.map((c) => (
									<li
										key={c.id || c._id}
										className="flex flex-col gap-1 rounded border border-slate-800 bg-slate-950 px-3 py-2"
									>
										<div className="flex items-center justify-between gap-2">
											<div>
												<div className="font-medium text-sm">{c.title}</div>
												{c.shortDescription && (
													<div className="text-xs text-slate-400">{c.shortDescription}</div>
												)}
											</div>
											<button
												type="button"
												onClick={() => {
													// TODO: router.push(`/campaigns/${c.id || c._id}`);
												}}
												className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
											>
												{campaignFilter === "in-progress" ? "Resume" : "Start Campaign"}
											</button>
										</div>
									</li>
								))}
						</ul>
					)}
				</section>
			)}

      {/* Accomplishments tab */}
      {activeTab === "accomplishments" && (
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">My Accomplishments</h2>
          </div>
          <p className="text-sm text-slate-400">
            Coming soon: achievements, milestones, and notable story moments across your campaigns.
          </p>
        </section>
      )}

      {/* Completed campaigns tab */}
      {activeTab === "completed" && (
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">My Completed Campaigns</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log("TODO: open story-creation / publishing flow from a completed campaign");
                }}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Publish Your Campaign
              </button>
            </div>
          </div>

          {completedCampaigns.length === 0 ? (
            <p className="text-sm text-slate-400">
              When you finish a campaign, it will appear here so you can reread it and spin it into something bigger.
            </p>
          ) : (
            <ul className="space-y-2">
              {completedCampaigns.map((c) => (
                <li
                  key={c.id || c._id}
                  className="rounded border border-slate-800 bg-slate-950 px-3 py-2 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      {typeof c.worldId === "object" && c.worldId && "name" in c.worldId && c.worldId.name && (
                        <div className="text-xs text-slate-400">
                          World: {c.worldId.name}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        console.log("TODO: open raw campaign view for", c.id || c._id);
                      }}
                      className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
                    >
                      View Campaign
                    </button>
                  </div>
                  {c.shortDescription && (
                    <div className="text-xs text-slate-400">{c.shortDescription}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
