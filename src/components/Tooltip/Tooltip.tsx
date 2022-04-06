import { ReactNode } from 'react'
import styled from 'styled-components'
import DynamicPopover, {
  IDynamicPopover,
} from '../DynamicPopover/DynamicPopover'

interface ITooltip extends Omit<IDynamicPopover, 'popover'> {
  message?: ReactNode
  linkUrl?: string
  linkText?: string
}

const Popover = styled.div`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.02);
  border-radius: 14px;
  padding: 10px 10px 10px 14px;
  display: flex;
  flex-direction: column;
  max-width: 230px;
  > * {
    margin-top: 6px;
  }
  > *:first-child {
    margin-top: 0;
  }
  transition: 300ms linear;
`

const Message = styled.div`
  font-family: Arial;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: -0.01em;
`

const LinkContainer = styled.a`
  font-family: Arial;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 130%;
  display: flex;
  align-items: center;
  letter-spacing: -0.01em;
  background: linear-gradient(
    330.4deg,
    #44bcf0 4.54%,
    #7298f8 59.2%,
    #a099ff 148.85%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`

const Tooltip = ({ message, linkText, linkUrl, ...props }: ITooltip) => {
  const popover = (
    <Popover>
      {message && <Message>{message}</Message>}
      {linkText && linkUrl && (
        <LinkContainer href={linkUrl} target="_blank">
          {linkText} ↗️
        </LinkContainer>
      )}
    </Popover>
  )

  return DynamicPopover({
    popover,
    placement: 'left-end',
    ...props,
  })
}

export default Tooltip
