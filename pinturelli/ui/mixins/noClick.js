
export default noClick = (Base) => class extends Base {
  
  handleClick() {
    console.log('clicked in noclick area');
  }
}