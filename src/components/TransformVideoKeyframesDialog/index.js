// @flow weak

import React from "react"
import SimpleDialog from "../SimpleDialog"
import Box from "@material-ui/core/Box"
import ArrowForwardIcon from "@material-ui/icons/ArrowForward"
import * as colors from "@material-ui/core/colors"
import { styled } from "@material-ui/core/styles"
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import immutable from "seamless-immutable"

const Code = styled("pre")({
  fontSize: 8,
})

const StyledExpansionPanel = styled(ExpansionPanel)({
  backgroundColor: colors.grey[100],
  border: `1px solid ${colors.grey[500]}`,
  marginTop: 16,
  marginBottom: 16,
})

const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)({
  fontWeight: "bold",
})

export default ({ open, onChangeOHA, onClose, oha }) => {
  return (
    <SimpleDialog
      open={open}
      onClose={onClose}
      title="Transform Video Keyframes"
      actions={[
        {
          text: "Transform Video Keyframes",
          disabled: !oha.samples,
          onClick: () => {
            const samples = oha.samples.flatMap((item, index) => {
              if (!item.videoUrl) return { data: item, output: item.annotation }
              if (item.videoUrl && !item.videoFrameAt) {
                if (!item.annotation) return []
                if (!item.annotation.keyframes) return []
                const { keyframes } = item[index].annotation
                return Object.keys(keyframes).map((kf) => ({
                  videoUrl: item.videoUrl,
                  videoFrameAt: parseInt(kf),
                  annotation: keyframes[kf].regions || [],
                }))
              }
            })

            onChangeOHA(
              immutable(oha)
                .setIn(
                  ["samples"],
                  samples.map((s) => s.data)
                )
                .setIn(["interface", "type"], "image_segmentation")
            )
          },
        },
      ]}
    >
      This operation will convert keyframes set on a video into individual image
      segmentation frames. Your interface type will change from
      "video_segmentation" into "image_segmentation". This is sometimes helpful
      when preparing video data for a computer vision model.
      {!oha.samples && (
        <b>
          <br />
          <br />
          You need to label some keyframes to use this.
        </b>
      )}
      <StyledExpansionPanel>
        <StyledExpansionPanelSummary>Details</StyledExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Box display="flex">
            <Box>
              <Code>
                {`{
  "interface": { "type": "video_segmentation" },
  samples: [
    {
      videoUrl: "https://example.com/video1.mp4"
    }
  ],
  taskOutput: [
    {
      keyframes: {
        "0": { /* labels */ },
        "1000": { /* labels */ },
        "2000": { /* labels */ }
      }
    }
  ]
}`}
              </Code>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <ArrowForwardIcon
                style={{ color: colors.grey[500], width: 48, height: 48 }}
              />
            </Box>
            <Box>
              <Code>
                {`{
  "interface": { "type": "image_segmentation" },
  samples: [
    {
      videoUrl: "https://example.com/vid1.mp4",
      videoFrameAt: 0
    },
    {
      videoUrl: "https://example.com/vid1.mp4",
      videoFrameAt: 1000
    },
    {
      videoUrl: "https://example.com/vid1.mp4",
      videoFrameAt: 2000
    }
  ],
  taskOutput: [
    { /* labels */ },
    { /* labels */ },
    { /* labels */ }
  ]
}`}
              </Code>
            </Box>
          </Box>
        </ExpansionPanelDetails>
      </StyledExpansionPanel>
    </SimpleDialog>
  )
}
