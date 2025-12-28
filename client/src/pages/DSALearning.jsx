export default function DSALearning() {
    return (
        <div className="min-h-screen bg-[#0b0f14] text-white">



            {/* MAIN GRID */}
            <div className="grid grid-cols-[1fr_320px] gap-6 p-6">

                {/* LEFT CONTENT */}
                <div>

                    {/* VIDEO PLAYER */}
                    <div className="relative bg-[#0f151c] border border-cyan-500/30 rounded-xl h-[420px] flex items-center justify-center">

                        <span className="absolute top-4 left-4 text-xs text-green-400 border border-green-400/30 px-3 py-1 rounded-full">
                            NO PAYWALLS – FREE MAAL
                        </span>

                        <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                            ▶
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="h-1 bg-white/10 rounded-full">
                                <div className="h-1 w-[30%] bg-cyan-400 rounded-full" />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>14:02</span>
                                <span>45:00</span>
                            </div>
                        </div>
                    </div>

                    {/* TITLE */}
                    <h1 className="mt-6 text-2xl font-bold">
                        MISSION CONTROL: LINKED LIST REVERSAL
                    </h1>

                    <p className="mt-2 text-gray-400 max-w-3xl">
                        Start engine… Aaj hum seekhenge linked list ko palatna.
                        Pointer ka khel hai babua, dhyaan se.
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4 mt-4">
                        <button className="bg-white/10 px-4 py-2 rounded-md text-sm hover:bg-white/20">
                            👍 Ek Number
                        </button>
                        <button className="bg-white/10 px-4 py-2 rounded-md text-sm hover:bg-white/20">
                            🔗 Bhejo Dost Ko
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex gap-6 mt-8 border-b border-white/10">
                        <button className="pb-2 border-b-2 border-cyan-400 text-cyan-400">
                            Likh Lo (Notes)
                        </button>
                        <button className="pb-2 text-gray-400">Code Kar</button>
                        <button className="pb-2 text-gray-400">Khazana</button>
                    </div>

                    {/* NOTES */}
                    <div className="mt-6 bg-[#0f151c] border border-white/10 rounded-xl p-6">

                        <h2 className="font-semibold mb-3">
                            💡 Quick Concept: Iterative Approach
                        </h2>

                        <ul className="text-sm text-gray-300 space-y-2">
                            <li>• Teen pointer chahiye: <code className="text-cyan-400">prev</code>, <code className="text-cyan-400">curr</code>, <code className="text-cyan-400">next</code></li>
                            <li>• Jab tak <code className="text-cyan-400">curr != NULL</code>, loop chalao</li>
                            <li>• Link palto aur pointers aage badhao</li>
                        </ul>

                        <pre className="mt-4 bg-black rounded-lg p-4 text-sm overflow-x-auto text-green-400">
                            {`struct Node* reverseList(struct Node* head) {
  struct Node *prev = NULL, *curr = head, *next = NULL;

  while (curr != NULL) {
    next = curr->next;
    curr->next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`}
                        </pre>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="bg-[#0f151c] border border-white/10 rounded-xl p-4 h-fit sticky top-20">

                    <h3 className="font-semibold mb-4">📘 Apna Syllabus</h3>

                    <div className="text-xs text-gray-400 mb-2">
                        Progress: <span className="text-cyan-400">45%</span>
                    </div>

                    <div className="space-y-3 text-sm">

                        <Section title="Introduction">
                            <Item done label="Why DSA?" />
                            <Item done label="Time Complexity" />
                        </Section>

                        <Section title="Linked Lists">
                            <Item done label="What is Node?" />
                            <Item active label="Reverse List" />
                            <Item locked label="Detect Cycle" />
                        </Section>

                        <Section title="Stacks & Queues">
                            <Item locked label="Stack Implementation" />
                        </Section>
                    </div>

                    <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm">
                        <strong>Arre Babua?</strong>
                        <p className="text-gray-300 mt-1">Kuch samajh nahi aaya?</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

/* ------------------ Components ------------------ */

function Section({ title, children }) {
    return (
        <div>
            <p className="text-xs uppercase text-gray-400 mb-2">{title}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Item({ label, done, active, locked }) {
    let styles = "text-gray-400";
    if (done) styles = "text-green-400";
    if (active) styles = "text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded";
    if (locked) styles = "text-gray-600";

    return (
        <div className={`text-sm ${styles}`}>
            {label}
        </div>
    );
}
