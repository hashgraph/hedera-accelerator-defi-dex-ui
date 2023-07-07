/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable max-len */
import { isNotNil } from "ramda";
import { HIPMetaData, ProposalType } from "./types";
import "./HIPProposal.styles.css";

interface HIPProposalProps {
  metadata: string;
}

export function HIPProposal(props: HIPProposalProps) {
  const { metadata } = props;
  let proposalData: HIPMetaData | undefined = undefined;
  console.log(metadata);
  try {
    proposalData = JSON.parse(metadata);
  } catch (e) {
    console.log(e);
    return <>Proposal Format Not Valid.</>;
  }

  if (isNotNil(proposalData)) {
    const {
      proposalType,
      hip,
      title,
      authors,
      status,
      type,
      category,
      needsCouncilApproval,
      created,
      discussionLink,
      updated,
      requires,
      replaces,
      supersededBy,
      body,
    } = proposalData;
    const {
      abstract,
      motivation,
      rationale,
      user_stories,
      specification,
      backwards_compatibility,
      security_implications,
      how_to_teach_this,
      reference_implementation,
      rejected_ideas,
      open_issues,
      references,
      copyright_license,
    } = body;
    if (proposalType === ProposalType.HIP) {
      return (
        <div className="wrapper">
          <div className="home">
            <h1 className="page-heading">
              <a
                href={`https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-${hip}.md`}
                target="_blank"
                rel="noreferrer"
              >
                HIP-{hip}:
              </a>{" "}
              {title}
            </h1>
            <table>
              <tbody>
                <tr>
                  <th>Author</th>
                  <td>
                    <a href="https://github.com/lbaird">
                      {authors.map((author) => (
                        <>{`${author.name} <${author.email}>`}</>
                      ))}
                    </a>
                  </td>
                </tr>
                <tr>
                  <th>Discussions-To</th>
                  <td>
                    <a href="https://github.com/hashgraph/hedera-improvement-proposal/discussions/201">
                      {discussionLink}
                    </a>
                  </td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    {status}{" "}
                    <span
                      className="tooltip"
                      data-tooltip="👍 An accepted HIP is a HIP that went through the 'Last Call' status period without changes to the content and is considered ready for implementation."
                      style={{ textDecoration: "none" }}
                    >
                      ⓘ
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Needs Council Approval</th>
                  <td>
                    {needsCouncilApproval ? "Yes" : "No"}{" "}
                    <span
                      className="tooltip"
                      data-tooltip="👥 This HIP requires council approval for implementation because it makes changes at the protocol level."
                      style={{ textDecoration: "none" }}
                    >
                      ⓘ
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>
                    Review period ends{" "}
                    <span
                      className="tooltip"
                      data-tooltip="⏳ The last call review period ends on this date, after which the HIP's status may change."
                      style={{ textDecoration: "none" }}
                    >
                      ⓘ
                    </span>
                  </th>
                  <td>Mon, 22 Nov 2021 07:00:00 +0000</td>
                </tr>
                <tr>
                  <th>Type</th>
                  <td>
                    {type}{" "}
                    <span
                      className="tooltip"
                      data-tooltip="📚 Informational HIPs describe a design issue or provide general guidelines."
                      style={{ textDecoration: "none" }}
                    >
                      ⓘ
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Created</th>
                  <td>{created}</td>
                </tr>
              </tbody>
            </table>
            <div className="toc">
              <h2>Table of Contents</h2>
              <ul>
                <li>
                  <a href="#abstract">Abstract</a>
                </li>
                <li>
                  <a href="#motivation">Motivation</a>
                </li>
                <li>
                  <a href="#rationale">Rationale</a>
                </li>
                <li>
                  <a href="#specification">Specification</a>
                </li>
                <li>
                  <a href="#backwards-compatibility">Backwards Compatibility</a>
                </li>
                <li>
                  <a href="#security-implications">Security Implications</a>
                </li>
                <li>
                  <a href="#how-to-teach-this">How to Teach This</a>
                </li>
                <li>
                  <a href="#reference-implementation">Reference Implementation</a>
                </li>
                <li>
                  <a href="#rejected-ideas">Rejected Ideas</a>
                </li>
                <li>
                  <a href="#open-issues">Open Issues</a>
                </li>
                <li>
                  <a href="#references">References</a>
                </li>
                <li>
                  <a href="#copyrightlicense">Copyright/license</a>
                </li>
              </ul>
            </div>
            <h2 id="abstract">
              <a href="#abstract" className="anchor-link"></a> Abstract
            </h2>
            <p>{abstract}</p>
            <h2 id="motivation">
              <a href="#motivation" className="anchor-link"></a> Motivation
            </h2>
            <p>{motivation}</p>
            <h2 id="rationale">
              <a href="#rationale" className="anchor-link"></a> Rationale
            </h2>
            <p>{rationale}</p>
            <h2 id="specification">
              <a href="#specification" className="anchor-link"></a> Specification
            </h2>
            <p>{specification}</p>
            <h2 id="backwards-compatibility">
              <a href="#backwards-compatibility" className="anchor-link"></a> Backwards Compatibility
            </h2>
            <p>{backwards_compatibility}</p>
            <h2 id="security-implications">
              <a href="#security-implications" className="anchor-link"></a> Security Implications
            </h2>
            <p>{security_implications}</p>
            <h2 id="how-to-teach-this">
              <a href="#how-to-teach-this" className="anchor-link"></a> How to Teach This
            </h2>
            <p>{how_to_teach_this}</p>
            <h2 id="reference-implementation">
              <a href="#reference-implementation" className="anchor-link"></a> Reference Implementation
            </h2>
            <p>{reference_implementation}</p>
            <h2 id="rejected-ideas">
              <a href="#rejected-ideas" className="anchor-link"></a> Rejected Ideas
            </h2>
            <p>{rejected_ideas}</p>
            <h2 id="open-issues">
              <a href="#open-issues" className="anchor-link"></a> Open Issues
            </h2>
            <p>{open_issues}</p>
            <h2 id="references">
              <a href="#references" className="anchor-link"></a> References
            </h2>
            <p>{references}</p>
            <h2 id="copyrightlicense">
              <a href="#copyrightlicense" className="anchor-link"></a> Copyright/license
            </h2>
            <p>{copyright_license}</p>
            <h2>Citation</h2>
            <p>Please cite this document as:</p>
          </div>
        </div>
      );
    }
    return <>Proposal Format Not Recognized</>;
  }

  return <>...rendering</>;
}
