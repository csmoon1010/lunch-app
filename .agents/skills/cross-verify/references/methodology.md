# Cross Verification Methodology

Use this reference when explaining or adapting the cross-verify protocol.

## Method Sources

- IEEE 1012 verification and validation treats V&V as determining both whether an activity product conforms to its requirements and whether the system satisfies intended use and user needs. Apply this as two questions: is the claim supported, and is the proposed action useful in context? Source: https://standards.ieee.org/ieee/1012/7324/
- IEEE 1028 defines systematic software reviews and audits, including inspections, walk-throughs, technical reviews, management reviews, and audits. Apply this by keeping the review process explicit and documented. Source: https://standards.ieee.org/ieee/1028/4402/
- NASA IV&V emphasizes objective examination, independence, risk reduction, and the questions "was the right system built" and "was the system built correctly." Apply this by separating factual verification from solution-fit evaluation. Source: https://swehb.nasa.gov/spaces/SWEHBVC/pages/50888971/SWE-141+-+Software+Independent+Verification+and+Validation
- NASA formal inspection guidance uses defined roles such as moderator, recorder, reader, author, and inspector, plus preparation, inspection meeting, defect recording, rework, and follow-up. Apply this by making the main agent the moderator/recorder/judge and the subagents independent inspectors. Source: https://ntrs.nasa.gov/api/citations/19980228472/downloads/19980228472.pdf
- Perspective-Based Reading assigns reviewers different perspectives such as tester, developer, and user to increase coverage. Apply this by making one subagent emphasize factuality and the other emphasize effectiveness and fit. Source: https://ntrs.nasa.gov/citations/19990018557
- Delphi method uses independent expert inputs, facilitator summaries, controlled feedback, and limited iteration toward consensus. Apply this as "Delphi-lite": private first passes, a facilitator dispute summary, and at most one reconsideration round. Source: https://otexts.com/fpp3/delphimethod.html
- Analysis of Competing Hypotheses and devil's advocacy emphasize alternative hypotheses, disconfirming evidence, and challenge to dominant conclusions. Apply this by asking for counterevidence and by rejecting claims that survive only because no one looked for a contrary explanation. Source: https://www.stat.berkeley.edu/~aldous/157/Papers/Tradecraft%20Primer-apr09.pdf
- Multi-agent debate and self-consistency research suggest multiple model instances and multiple reasoning paths can improve factuality and reasoning, but agreement is only useful when supported by evidence. Apply this by judging evidence quality, not vote count. Sources: https://arxiv.org/abs/2305.14325 and https://arxiv.org/abs/2203.11171

## Design Rules

- Preserve independence before synthesis. Early sharing creates anchoring and reduces the value of the second pass.
- Keep perspectives complementary. Both subagents may report any issue, but each must emphasize a different failure mode.
- Prefer disconfirmation. Ask what would make a finding false, ineffective, or unsuitable.
- Limit debate. One reconsideration round is enough for most engineering decisions; more rounds usually add cost and convergence pressure.
- Keep the final decision evidence-weighted. A single directly reproduced contradiction can outweigh two plausible but unsupported endorsements.
