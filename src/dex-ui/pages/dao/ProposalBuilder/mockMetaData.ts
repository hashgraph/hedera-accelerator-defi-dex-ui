/* eslint-disable max-len */
import { HIPCateogry, HIPMetaData, HIPStatus, HIPType, ProposalType } from "./types";

export const mockHIPMetaData: HIPMetaData = {
  proposalType: ProposalType.HIP,
  hip: 13,
  title: "Hedera Name Service",
  authors: [{ name: "H. Bart", email: "hbart.lint@gmail.com" }],
  status: HIPStatus.Accepted,
  type: HIPType.StandardsTrack,
  category: HIPCateogry.Application,
  doesNeedCouncilApproval: false,
  created: "2021-03-13",
  discussionLink: "https://github.com/hashgraph/hedera-improvement-proposal/discussions/56",
  updated: ["2021-05-12", "2021-11-30"],
  requires: [534, 34, 534],
  replaces: [42],
  supersededBy: [23],
  body: {
    abstract:
      "The Public Key Infrastructure (PKI) of today is highly centralised with a handful of certificate authorities(CAs) being responsible to validate digital identities(such as domains) by vouching for public keys associated with said identities. This system if highly vulnerable as if any one of the existing list of trusted CAs is compromised so is the entire security of the internet. One solution to this is DNS-based Authentication of Named Entities(DANE) which enables domain owners to store a TSLA record in the Domain Name System(DNS) that defines a contract for how clients can trust a public key is in fact owned by said domain before proceeding to establish a TLS connection. However DANE relies on DNSSEC which relies on a chain of trust akin to that in existing CA PKI as previously mentioned hence is susceptible to similar attacks.By moving DNS (w/ DANE enabled) onto a secure decentralised network such as Hedera security issues resulting from the chain of trust in existing systems are mitigated and if widely adopted would render all existing CAs, DNS stakeholders(ICANN, domain registrars) obsolete.",
    motivation:
      "The Hedera Public Ledger is a secure scalable decentralised ledger making it an ideal candidate to supersede existing centralised DNS and PKI systems. Currently the most secure implementations of these systems rely on a chain of trust which is compromised if at least 1-of-m entities in the chain is compromised. The shortcomings inherent to this chain of trust can be mitigated by being replaced with the aBFT consensus of Hedera, hence in order to compromise even a single DNS Resource Record(RR) an attacker must control at least 1/3 of the consensus vote.",
    rationale:
      "The Hedera Name Service offers numerous benefits to both domain owners and internet users over existing centralised systems.",
    user_stories: "N/A",
    specification:
      "Backwards Compatibility will be described more completely in the next section. To allow for backwards compatibility with existing DNS infrastructure Hedera will initially only allow for HNS native second-level domains(SLD) to be registered under the top-level domain(TLD) “.hh”(which is an initialism for Hedera Hashgraph). Furthermore, an SLD owner can register subdomains under their SLD, noting that the SLD comprises the subdomains in a non-fungible manner, hence any transfer of a given SLD entails the transfer of that SLD’s subdomains if any. It is suggested that the Hedera Council secure ownership of the TLD “.hh” from ICANN.",
    backwards_compatibility:
      "To ensure backwards compatibility with existing DNS infrastructure all domain owners that can prove ownership of a domain and its associated public key to the Hedera network can be onboarded onto HNS. This can be achieved by a domain owner proving ownership of a public key vouched for in SSL certificate for said domain that must be signed by any one CA in the list of trusted CAs vetted by the Hedera Council. If HNS were to be widely adopted the Hedera network may decide to enable registration of SLDs under TLDs other than the TLD “.hh” and TLDs still managed by ICANN. However if HNS were to become the de facto domain name system, the Hedera network may assume management of all TLDs.",
    security_implications:
      "The Hedera Council may have to continuously update the list of trusted CA’s to enable the secure onboarding of existing DNS domain owners.",
    how_to_teach_this:
      "Frontend interfaces would have to be developed for enabling users to register HNS native SLDs or for onboarding existing domains and should have their respective tutorials educating their userbase on proper interaction with their application. In addition the Hedera developer tutorials/documentation should be sufficiently detailed to enable the development of the aforementioned user facing applications.",
    reference_implementation: "N/A",
    rejected_ideas: "N/A",
    open_issues: "N/A",
    references:
      "DANE: https://tools.ietf.org/html/rfc7671 Handshake: https://handshake.org/files/handshake.txt Namebase: https://www.namebase.io/ DPKI: https://danubetech.com/download/dpki.pdf Namecoin Whitepapers: https://www.namecoin.org/resources/whitepaper/ ENS: https://docs.ens.domains/ Unstoppable Domains: https://docs.unstoppabledomains.com/ Polkadot Parachain Slots Candle Auctions: https://wiki.polkadot.network/docs/en/learn-auction",
    copyright_license:
      "This document is licensed under the Apache License, Version 2.0 – see LICENSE or (https://www.apache.org/licenses/LICENSE-2.0)",
  },
};
