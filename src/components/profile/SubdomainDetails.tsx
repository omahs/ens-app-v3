import { imageUrlUnknownRecord } from "@app/utils/utils";
import {
  Avatar,
  Box,
  IconArrowRight,
  Stack,
  Typography,
  vars,
} from "@ensdomains/thorin";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";

type Subdomain = {
  name: string;
  formattedName: string;
};

const SubdomainWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${vars.space["3"]} ${vars.space["4.5"]};
  border-bottom: 1px solid ${vars.colors.borderTertiary};
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: ${vars.colors.backgroundTertiary};
  }

  &:last-of-type {
    border: none;
  }
`;

const SubdomainItem = ({
  name,
  formattedName,
  network,
}: Subdomain & {
  network: string;
}) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const run = async () => {
      const response = await fetch(imageUrlUnknownRecord(name, network));
      const imgBlob = response && (await response.blob());
      const _src = URL.createObjectURL(imgBlob);
      if (imgBlob?.type.startsWith("image/")) {
        setSrc(_src);
      }
    };

    run();
  }, [name, network]);

  return (
    <Link href={`/profile/${name}`} passHref>
      <SubdomainWrapper as="a">
        <Stack direction="horizontal" justify="center" align="center" space="4">
          <Avatar
            label={formattedName}
            src={src}
            placeholder={src === ""}
            size="9"
          />
          <Typography color="text" weight="bold" size="extraLarge">
            {formattedName}
          </Typography>
        </Stack>
        <IconArrowRight strokeWidth="0.75" color="textTertiary" />
      </SubdomainWrapper>
    </Link>
  );
};

export const SubdomainDetails = ({
  subdomains,
  network,
  loading,
}: {
  subdomains: Subdomain[];
  network: string;
  loading: boolean;
}) => {
  const { t } = useTranslation("profile");

  return (
    <>
      {!loading && subdomains && subdomains.length > 0 ? (
        subdomains.map((subdomain) => (
          <SubdomainItem network={network} {...subdomain} />
        ))
      ) : (
        <Box
          padding="4"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {loading ? t("tabs.subdomains.loading") : t("tabs.subdomains.empty")}
        </Box>
      )}
    </>
  );
};