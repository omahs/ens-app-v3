import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { ProfileNftDetails } from "./ProfileNftDetails";

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseDomain = {
  isWrapped: false,
  owner: "0x0000000000000000000000000000000000000123",
  registrant: "0x0000000000000000000000000000000000000456",
};

const expiryDate = new Date();

describe("ProfileNftDetails", () => {
  it("should show registrant and controller with unwrapped domain data", async () => {
    render(
      <MockedProvider>
        <ProfileNftDetails
          domain={baseDomain}
          expiryDate={expiryDate}
          name="test.eth"
          network="mainnet"
        />
      </MockedProvider>
    );
    expect(screen.getByText("name.registrant")).toBeInTheDocument();
    // Registrant field should have registrant address
    expect(screen.getByText("name.registrant").parentNode).toHaveTextContent(
      "456"
    );
    expect(screen.getByText("name.controller")).toBeInTheDocument();
    // Controller field should have owner address
    expect(screen.getByText("name.controller").parentNode).toHaveTextContent(
      "123"
    );
  });
  it("should should only owner with wrapped domain data", () => {
    const domain = {
      ...baseDomain,
      isWrapped: true,
    };

    render(
      <MockedProvider>
        <ProfileNftDetails
          domain={domain}
          expiryDate={expiryDate}
          name="test.eth"
          network="mainnet"
        />
      </MockedProvider>
    );
    expect(screen.getByText("name.owner")).toBeInTheDocument();
    // Owner field should have owner address
    expect(screen.getByText("name.owner").parentNode).toHaveTextContent("123");
    expect(screen.queryByText("name.registrant")).toBeNull();
    expect(screen.queryByText("name.controller")).toBeNull();
  });
});
