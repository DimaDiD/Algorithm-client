const TextContent = ({ text }: { text: string }) => {
    return (
      <>
        <div style={{borderRadius: "15px", margin:"15px 50px 15px 50px",}}>
          <div dangerouslySetInnerHTML={{ __html: text }}></div>
        </div>
      </>
    );
  };
  
  export default TextContent;