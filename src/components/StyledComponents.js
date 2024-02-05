// StyledComponents.js
import styled, { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const ShipContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

export const Ship = styled.div`
  width: ${({ length }) => length * 40}px;
  height: 40px;
  background-color: #8b0000;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  opacity: ${({ isPlaced }) => (isPlaced ? 1 : 0)};
  animation: ${fadeIn} 0.5s ease-in-out;
`;

export const Cell = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  background-color: ${({ isHit, isShip }) =>
    isHit ? '#ff6347' : isShip ? '#8b0000' : '#f0f0f0'};
  color: ${({ isHit }) => (isHit ? '#fff' : '#000')};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
`;

export const Message = styled.div`
  margin: 10px 0;
  font-size: 20px;
`;

export const ResetButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
`;

export const TurnIndicator = styled.div`
  text-align: center;
  margin-bottom: 20px;
  h2 {
    margin: 0;
    font-size: 20px;
    color: ${({ currentPlayer }) => (currentPlayer === 1 ? '#007bff' : '#ff6347')};
  }
`;

export const ScoreboardContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

export const PlayerScore = styled.div`
  text-align: center;
  h2 {
    margin: 0;
    font-size: 16px;
    color: #000;
  }
  p {
    margin: 5px 0;
    font-size: 14px;
  }
`;
