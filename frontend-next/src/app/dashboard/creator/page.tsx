"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import React from "react";

type User = {
  id: string;
  email: string;
  displayName: string;
  plan: string;
  aiUsageThisPeriod: number;
  createdAt: string;
};

type World = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  defaultTags?: string[];
};

type Campaign = {
  id?: string;
  _id?: string;
  title: string;
  shortDescription?: string;
  worldId?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | string;
  tags?: string[];
  isPaid?: boolean;
  visibility?: string;
};

type WorldsResponse = {
  success: boolean;
  data?: {
    worlds: World[];
    pagination: { page: number; total: number };
  };
  error?: string;
};

type MyWorldsResponse = {
  success: boolean;
  data?: {
    worlds: World[];
    pagination?: { page: number; total: number };
  };
  error?: string;
};

type CampaignsResponse = {
  success: boolean;
  data?: {
    campaigns: Campaign[];
    pagination: { page: number; total: number };
  };
  error?: string;
};

type MeResponse = {
  success: boolean;
  data?: { user: User };
  error?: string;
};

export default function CreatorHubPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myWorlds, setMyWorlds] = useState<World[]>([]);

  // Create World form state
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldSlug, setNewWorldSlug] = useState("");
  const [newWorldDescription, setNewWorldDescription] = useState("");
  const [isCreatingWorld, setIsCreatingWorld] = useState(false);
  const [createWorldError, setCreateWorldError] = useState<string | null>(null);
  const [showWorldCreate, setShowWorldCreate] = useState(false);

  type CreatorTab =
  | "worlds"
  | "campaigns"
  | "npcs"
  | "bestiary"
  | "locations"
  | "items";

  const [activeTab, setActiveTab] = useState<CreatorTab>("worlds");

  const handleLogout = async () => {
    try {
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      router.push("/login");
    }
  };

	const handleCreateWorld = async (e: React.FormEvent) => {
	e.preventDefault();
	setCreateWorldError(null);

	if (!newWorldName.trim()) {
	setCreateWorldError("World name is required.");
	return;
	}

	const slug = newWorldSlug.trim() || newWorldName.trim().toLowerCase().replace(/\s+/g, "-");

	setIsCreatingWorld(true);

	try {
	const res = await fetch(apiUrl("/api/worlds"), {
			method: "POST",
			credentials: "include",
			headers: {
			"Content-Type": "application/json",
			},
			body: JSON.stringify({
			name: newWorldName.trim(),
			slug,
			description: newWorldDescription.trim() || undefined,
			}),
	});

	const data = await res.json();

	if (!res.ok || !data?.success) {
			const message =
			data?.error ||
			data?.message ||
			"Failed to create world. Please try again.";
			setCreateWorldError(message);
			return;
	}

	const created = data.data?.world as World | undefined;

	if (created) {
			setMyWorlds((prev) => [created, ...prev]);
	}

	setNewWorldName("");
	setNewWorldSlug("");
	setNewWorldDescription("");
	} catch (err) {
	console.error("Create world error", err);
	setCreateWorldError("Unexpected error creating world.");
	} finally {
	setIsCreatingWorld(false);
	}
	};


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

        const [worldsRes, myWorldsRes, campaignsRes] = await Promise.all([
        fetch(apiUrl("/api/worlds/public"), { credentials: "include" }),
        fetch(apiUrl("/api/worlds/mine"), { credentials: "include" }),
        fetch(apiUrl("/api/campaign-defs/public"), { credentials: "include" }),
        ]);

        const [worldsJson, myWorldsJson, campaignsJson]: [
        WorldsResponse,
        MyWorldsResponse,
        CampaignsResponse,
        ] = await Promise.all([
        worldsRes.json(),
        myWorldsRes.json(),
        campaignsRes.json(),
        ]);


        if (worldsJson.success && worldsJson.data?.worlds) {
          setWorlds(worldsJson.data.worlds);
        }

        if (myWorldsJson.success && myWorldsJson.data?.worlds) {
          setMyWorlds(myWorldsJson.data.worlds);
        } else if (myWorldsJson.error) {
        console.warn("My worlds error:", myWorldsJson.error);
        }

        if (campaignsJson.success && campaignsJson.data?.campaigns) {
          setCampaigns(campaignsJson.data.campaigns);
        }

      } catch (err) {
        console.error("Dashboard load error", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading && !user) {
    return (
      <main className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">StoryForge Dashboard</h1>
        <p className="text-sm text-slate-300">Loading your data...</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg space-y-6">
      <header className="border-b border-slate-800 pb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Creator Hub</h1>
          {user && (
            <p className="text-sm text-slate-300">
              Signed in as <span className="font-mono">{user.email}</span> ({user.plan})
            </p>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>

        <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          Log out
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/player")}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          Go to Player Hub
        </button>
        </div>
      </header>

      {/* Tab bar BELOW header */}
      <div className="border-b border-slate-800 mb-4">
        <nav className="flex flex-wrap gap-2 text-xs sm:text-sm">
          {[
            { id: "worlds", label: "My Worlds" },
            { id: "campaigns", label: "My Campaigns" },
            { id: "npcs", label: "My NPCs" },
            { id: "bestiary", label: "My Bestiary" },
            { id: "locations", label: "My Locations" },
            { id: "items", label: "My Items" },
            ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CreatorTab)}
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

      {activeTab === "worlds" && (
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">My Worlds</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowWorldCreate((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              {showWorldCreate ? "Close" : "Create World"}
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("TODO: navigate to Marketplace Worlds");
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Browse Marketplace Worlds
            </button>
          </div>
        </div>

        {/* Create World form */}
        {showWorldCreate && (
        <form
          onSubmit={handleCreateWorld}
          className="mb-4 space-y-2 rounded border border-slate-800 bg-slate-950 px-3 py-3"
        >
          <div className="text-sm font-medium mb-1">Create a new world</div>
          {createWorldError && (
            <p className="text-xs text-red-300 mb-1">{createWorldError}</p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium" htmlFor="world-name">
                Name
              </label>
              <input
                id="world-name"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="My New World"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium" htmlFor="world-slug">
                Slug (optional)
              </label>
              <input
                id="world-slug"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={newWorldSlug}
                onChange={(e) => setNewWorldSlug(e.target.value)}
                placeholder="my-new-world"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Lowercase letters, numbers, and hyphens only. Leave blank to
                auto-generate from the name.
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <label
              className="block text-xs font-medium"
              htmlFor="world-description"
            >
              Description (optional)
            </label>
            <textarea
              id="world-description"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              rows={2}
              value={newWorldDescription}
              onChange={(e) => setNewWorldDescription(e.target.value)}
              placeholder="A strange realm of fading magic..."
            />
          </div>
          <button
            type="submit"
            disabled={isCreatingWorld}
            className="mt-1 inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {isCreatingWorld ? "Creating..." : "Create World"}
          </button>
        </form>
        )}

        {/* My Worlds list */}
        {myWorlds.length === 0 ? (
          <p className="text-sm text-slate-400">
            You have no personal worlds yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {myWorlds.map((w) => (
              <li
                key={w.id || w._id}
                className="rounded border border-slate-800 bg-slate-950 px-3 py-2"
              >
                <div className="font-medium">{w.name}</div>
                {w.description && (
                  <div className="text-xs text-slate-400">{w.description}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {activeTab === "campaigns" && (
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">My Campaigns</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                console.log("TODO: open Create Campaign flow");
              }}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Create Campaign
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("TODO: navigate to Marketplace Campaigns");
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Browse Marketplace Campaigns
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-400">Coming Soon.</p>
        ) : (
          <ul className="space-y-2">
            {campaigns.map((c) => (
              <li
                key={c.id || c._id}
                className="rounded border border-slate-800 bg-slate-950 px-3 py-2"
              >
                <div className="font-medium">{c.title}</div>
                {typeof c.worldId === "object" && c.worldId?.name && (
                  <div className="text-xs text-slate-400">
                    World: {c.worldId.name}
                  </div>
                )}
                {c.shortDescription && (
                  <div className="text-xs text-slate-400">
                    {c.shortDescription}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {activeTab === "npcs" && (
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">My NPCs</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log("TODO: open Create NPC flow");
                }}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Create NPC
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("TODO: navigate to Marketplace NPCs");
                }}
                className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
              >
                Browse Marketplace NPCs
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Coming soon: manage NPC templates you create or license.
          </p>
        </section>
      )}

    {activeTab === "bestiary" && (
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">My Bestiary</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                console.log("TODO: open Create Creature flow");
              }}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Create Creature
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("TODO: navigate to Marketplace Bestiary");
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Browse Marketplace Bestiary
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Coming soon: creatures and monsters you can reuse across worlds.
        </p>
      </section>
    )}

    {activeTab === "locations" && (
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">My Locations</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                console.log("TODO: open Create Location flow");
              }}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Create Location
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("TODO: navigate to Marketplace Locations");
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Browse Marketplace Locations
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Coming soon: taverns, cities, dungeons, and other locations you own.
        </p>
      </section>
    )}

    {activeTab === "items" && (
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">My Items</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                console.log("TODO: open Create Item flow");
              }}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Create Item
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("TODO: navigate to Marketplace Items");
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Browse Marketplace Items
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Coming soon: magic items, gear, and artifacts for your campaigns.
        </p>
      </section>
    )}
    </main>
  );
}