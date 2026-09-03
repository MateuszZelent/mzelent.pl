import { describe, expect, it } from "vitest";

import { parseScholarHtml } from "../../src/app/api/admin/scholar/sync/route";

const SAMPLE_SCHOLAR_HTML = `
<!DOCTYPE html>
<html>
<body>
  <div id="gsc_rsb_st">
    <table>
      <tr>
        <td class="gsc_rsb_sc1"><a title="Citations">Citations</a></td>
        <td class="gsc_rsb_std">755</td>
        <td class="gsc_rsb_std">598</td>
      </tr>
      <tr>
        <td class="gsc_rsb_sc1"><a title="h-index">h-index</a></td>
        <td class="gsc_rsb_std">16</td>
        <td class="gsc_rsb_std">15</td>
      </tr>
      <tr>
        <td class="gsc_rsb_sc1"><a title="i10-index">i10-index</a></td>
        <td class="gsc_rsb_std">21</td>
        <td class="gsc_rsb_std">20</td>
      </tr>
    </table>
  </div>

  <table id="gsc_a_t">
    <tbody id="gsc_a_b">
      <tr class="gsc_a_tr">
        <td class="gsc_a_t">
          <a href="/citations?view_op=view_citation&amp;hl=en&amp;user=XkzMx4IAAAAJ&amp;citation_for_view=XkzMx4IAAAAJ:u5HHmVD_uO8C" class="gsc_a_at">Collective dynamical skyrmion excitations in a magnonic crystal</a>
          <div class="gs_gray">M Mruczkiewicz, P Gruszecki, M Zelent, M Krawczyk</div>
          <div class="gs_gray">Physical Review B 93 (17), 174429<span class="gs_oph">, 2016</span></div>
        </td>
        <td class="gsc_a_c">
          <a href="https://scholar.google.com/scholar?cites=123" class="gsc_a_ac gs_ibl">74</a>
        </td>
        <td class="gsc_a_y">
          <span class="gsc_a_h gsc_a_hc gs_ibl">2016</span>
        </td>
      </tr>

      <tr class="gsc_a_tr">
        <td class="gsc_a_t">
          <a href="/citations?view_op=view_citation&amp;hl=en&amp;user=XkzMx4IAAAAJ&amp;citation_for_view=XkzMx4IAAAAJ:WF5omc3nYNoC" class="gsc_a_at">Spin-wave phase inverter upon a single nanodefect</a>
          <div class="gs_gray">OV Dobrovolskiy, R Sachser, SA Bunyaev, D Navas, VM Bevz, M Zelent</div>
          <div class="gs_gray">ACS applied materials &amp; interfaces 11 (19), 17654-17662<span class="gs_oph">, 2019</span></div>
        </td>
        <td class="gsc_a_c">
          <a href="https://scholar.google.com/scholar?cites=456" class="gsc_a_ac gs_ibl">66</a>
        </td>
        <td class="gsc_a_y">
          <span class="gsc_a_h gsc_a_hc gs_ibl">2019</span>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

describe("Google Scholar Profile & Citation Parser", () => {
  it("correctly extracts author metrics (citations, h-index, i10-index)", () => {
    const { stats } = parseScholarHtml(SAMPLE_SCHOLAR_HTML);
    expect(stats.totalCitations).toBe(755);
    expect(stats.citationsSince2019).toBe(598);
    expect(stats.hIndex).toBe(16);
    expect(stats.i10Index).toBe(21);
  });

  it("correctly parses publication items from Scholar rows", () => {
    const { works } = parseScholarHtml(SAMPLE_SCHOLAR_HTML);
    expect(works.length).toBe(2);

    const first = works[0];
    expect(first.title).toBe("Collective dynamical skyrmion excitations in a magnonic crystal");
    expect(first.authors).toContain("M Zelent");
    expect(first.authors).toContain("M Krawczyk");
    expect(first.journal).toContain("Physical Review B");
    expect(first.citations).toBe(74);
    expect(first.year).toBe(2016);
    expect(first.scholarId).toBe("u5HHmVD_uO8C");

    const second = works[1];
    expect(second.title).toBe("Spin-wave phase inverter upon a single nanodefect");
    expect(second.citations).toBe(66);
    expect(second.year).toBe(2019);
    expect(second.scholarId).toBe("WF5omc3nYNoC");
  });

  it("handles malformed or empty HTML gracefully without throwing", () => {
    const emptyResult = parseScholarHtml("<html><body>No data</body></html>");
    expect(emptyResult.stats.totalCitations).toBe(0);
    expect(emptyResult.works).toEqual([]);
  });
});
