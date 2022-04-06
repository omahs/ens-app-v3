import { SearchInput } from '@app/components/SearchInput'
import Tooltip from '@app/components/Tooltip/Tooltip'
import { Basic } from '@app/layouts/Basic'
import mq from '@app/mediaQuery'
import { Box, Stack, Typography, vars } from '@ensdomains/thorin'
import type { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import styled from 'styled-components'

const GradientTitle = styled.h1`
  font-size: ${vars.fontSizes.headingTwo};
  text-align: center;
  font-weight: 800;
  background-image: ${vars.mode.gradients.accent};
  background-repeat: no-repeat;
  background-size: 110%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;

  ${mq.small.min`
    font-size: ${vars.fontSizes.headingOne};
  `}
`

const SubtitleWrapper = styled(Box)`
  max-width: calc(${vars.space['72']} * 2 - ${vars.space['4']});
  line-height: 150%;
  text-align: center;
  margin-bottom: ${vars.space['3']};
`

const TooltipButton = styled.div<{ open: boolean }>`
  color: ${(props) => (props.open ? 'black' : 'gray')};
  border-color: ${(props) => (props.open ? 'black' : 'gray')};
  border-width: 1px;
  border-style: solid;
  border-radius: 12px;
  width: 80px;
  display: flex;
  justify-content: center;
`

const Home: NextPage = () => {
  const { t } = useTranslation('common')

  const [toolTipOpen, setToolTipOpen] = useState(false)

  return (
    <Basic>
      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="full"
      >
        <Stack align="center" justify="center" space="3">
          <GradientTitle>{t('title')}</GradientTitle>
          <SubtitleWrapper>
            <Typography size="large" color="textSecondary" lineHeight="1.5">
              {t('description')}
            </Typography>
          </SubtitleWrapper>
          <SearchInput />
        </Stack>
      </Box>
      <Tooltip
        linkText="Read More"
        linkUrl="#"
        message={
          <span>
            The <b>Manager</b> of a name has the ability to edit the name&apos;s
            records. The <b>Owner</b> or Manager can change this record at any
            time.
          </span>
        }
        placement="top-end"
        onOpenChange={(_open) => setToolTipOpen(_open)}
      >
        <TooltipButton open={toolTipOpen}>Manager</TooltipButton>
      </Tooltip>
      <div style={{ height: '1000px' }} />
    </Basic>
  )
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
      // Will be passed to the page component as props
    },
  }
}

export default Home
